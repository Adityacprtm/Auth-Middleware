var jwt = require('jsonwebtoken')
let mongoose = require('mongoose')
var uniqid = require('uniqid');
const SECRET_KEY = 'supersecret'
var bcrypt = require('bcrypt')

let deviceSchema = mongoose.Schema({
    device_id: String,
    device_name: String,
    description: String,
    role: String,
    ip: String,
    timestamp: Number,
    token: String,
    user: String
}, { versionKey: false })

let userSchema = mongoose.Schema({
    username: String,
    password: String
})

function connect() {
    let mongoUrl = 'mongodb://127.0.0.1:27017/auth-middleware'
    mongoose.connect(mongoUrl, { useNewUrlParser: true })
}

function checkToken(token, callback) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, decoded)
        }
    })
}

function generateToken(docs, Models, callback) {
    var payload = {
        device_id: docs.device_id,
        device_name: docs.device_name,
        timestamp: docs.timestamp,
        role: docs.role
    }
    jwt.sign(payload, SECRET_KEY, { expiresIn: '1m', issuer: 'adityacprtm.com' }, (err, token) => {
        if (err) {
            callback(err.name, null)
        } else {
            payload['token'] = token
            Models.updateOne({ 'device_id': payload.device_id }, payload, function (err) {
                if (err) callback(err, null)
            })
            callback(null, token)
        }
    })
}

exports.request = function (payload, callback) {
    connect()
    let Models
    Models = mongoose.model('devices', deviceSchema)
    Models.findOne({ 'device_id': payload.device_id }, function (err, docs) {
        if (err) { callback(err, null) }
        if (docs) {
            docs.timestamp = payload.timestamp
            if (docs.token) {
                checkToken(docs.token, (err, reply) => {
                    if (err != null) {
                        generateToken(docs, Models, (err, token) => {
                            if (err != null) { callback(err, null) }
                            else { callback(null, token) }
                        })
                    }
                    else {
                        callback('Already has token', null)
                    }
                })
            } else {
                generateToken(docs, Models, (err, token) => {
                    if (err != null) { callback(err, null) }
                    else { callback(null, token) }
                })
            }
        } else {
            callback('Device Not Registered', null)
        }
    })
}

exports.validity = function (token, callback) {
    connect()
    checkToken(token, (err, reply) => {
        if (err != null) {
            callback(err, { 'status': false })
        } else {
            callback(null, { 'status': true, 'role': reply.role })
        }
    })
}

exports.check_user = function (data_user, callback) {
    connect()
    var Models
    Models = mongoose.model('users', userSchema)
    Models.find({ 'username': data_user.username }, function (err, entities) {
        if (err) { callback(err, null) }
        else {
            if (entities.length > 0) {
                entities.forEach(element => {
                    if (element.username == data_user.username && bcrypt.compareSync(data_user.password, element.password)) {
                        callback(null, true)
                    } else {
                        callback(null, false)
                    }
                })
            } else {
                callback(null, false)
            }
        }
    })
}

exports.device_handler = function (data_device, callback) {
    connect()
    data_device['device_id'] = uniqid.process()
    var Models = mongoose.model('devices', deviceSchema)
    Models.find({ 'device_name': data_device.device_name, 'user': data_device.user }, (err, entities) => {
        if (err) { callback(err, null) }
        else {
            if (entities.length == 0) {
                var device = new Models(data_device)
                device.save((err, device) => {
                    if (err) { callback(err, null) }
                    else { callback(null, 'Device Successfully Registered') }
                })
            } else {
                callback(null, 'Device Already Registered')
            }
        }
    })
}
