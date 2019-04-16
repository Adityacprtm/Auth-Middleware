var jwt = require('jsonwebtoken')
let mongoose = require('mongoose')
var uniqid = require('uniqid');
var bcrypt = require('bcrypt')
const SECRET_KEY = 'supersecret',
    EXP_TIME = '3m',
    ISSUER = 'adityacprtm.com',
    DEVICES_DB = 'devices',
    USERS_DB = 'users',
    HOST = 'mongodb://127.0.0.1:27017/',
    DB = 'auth-middleware'

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
    let mongoUrl = HOST + DB
    mongoose.connect(mongoUrl, { useNewUrlParser: true })
}

function check_token(token, callback) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, decoded)
        }
    })
}

function generate_token(docs, Models, callback) {
    var payload = {
        device_id: docs.device_id,
        device_name: docs.device_name,
        timestamp: docs.timestamp,
        role: docs.role
    }
    jwt.sign(payload, SECRET_KEY, { expiresIn: EXP_TIME, issuer: ISSUER }, (err, token) => {
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
    Models = mongoose.model(DEVICES_DB, deviceSchema)
    Models.findOne({ 'device_id': payload.device_id }, function (err, docs) {
        if (err) { callback(err, null) }
        if (docs) {
            docs.timestamp = payload.timestamp
            if (docs.token) {
                check_token(docs.token, (err, reply) => {
                    if (err != null) {
                        generate_token(docs, Models, (err, token) => {
                            if (err != null) { callback(err, null) }
                            else { callback(null, token) }
                        })
                    }
                    else {
                        callback('Already has token', null)
                    }
                })
            } else {
                generate_token(docs, Models, (err, token) => {
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
    check_token(token, (err, reply) => {
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
    Models = mongoose.model(USERS_DB, userSchema)
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
    var Models, temp
    temp = uniqid.process()
    Models = mongoose.model(DEVICES_DB, deviceSchema)
    Models.find({ 'device_id': temp }, (err, entities) => {
        if (err) { callback(err, null) }
        if (entities.length == 0) {
            data_device['device_id'] = temp
        } else {
            data_device['device_id'] = uniqid.process()
        }
        var device = new Models(data_device)
        device.save((err, device) => {
            if (err) { callback(err, null) }
            else { callback(null, 'Device Successfully Registered') }
        })
    })
}