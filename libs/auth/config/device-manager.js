
const jwt = require('jsonwebtoken')
const uniqid = require('uniqid')
const MongoClient = require('mongodb').MongoClient;
const SECRET_KEY = 'supersecret',
    EXP_TIME = '3m',
    ISSUER = 'adityacprtm.com',
    DEVICE_DB = 'devices',
    URI = 'mongodb://127.0.0.1:27017/',
    DB = 'auth-middleware'

var db, devices;
MongoClient.connect(URI, { useNewUrlParser: true }, function (e, client) {
    if (e) {
        console.log(e);
    } else {
        db = client.db(DB);
        devices = db.collection(DEVICE_DB);
        // index fields 'user' & 'email' for faster new account validation //
        devices.createIndex({ user: 1, email: 1 });
    }
})

exports.request = function (payload, callback) {
    devices.findOne({ device_id: payload.device_id }, function (err, docs) {
        if (err) { callback(err, null) }
        if (docs) {
            docs.timestamp = payload.timestamp
            if (docs.token) {
                checkToken(docs.token, (err, reply) => {
                    if (err != null) {
                        generateToken(docs, (err, token) => {
                            if (err != null) { callback(err, null) }
                            else { callback(null, token) }
                        })
                    }
                    else {
                        callback('Already has token', null)
                    }
                })
            } else {
                generateToken(docs, (err, token) => {
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
    checkToken(token, (err, reply) => {
        if (err != null) {
            callback(err, { 'status': false })
        } else {
            callback(null, { 'status': true, 'role': reply.role })
        }
    })
}

exports.addDevice = function (dataDevice, callback) {
    var temp
    temp = uniqid.process()
    devices.findOne({ device_id: temp }, (err, rep) => {
        if (err) { callback(err, null) }
        if (rep) {
            dataDevice['device_id'] = uniqid.process()
        } else {
            dataDevice['device_id'] = temp
        }
        devices.findOne({ device_name: dataDevice.device_name }, function (err, rep) {
            if (rep) {
                callback('device-name-taken')
            } else {
                devices.insertOne(dataDevice, (err, r) => {
                    if (err) { callback(err, null) }
                    else { callback(null, 'Device Successfully Registered') }
                })
            }
        })
    })
}

exports.getDevice = function (user, callback) {
    devices.find({ user: user }).toArray(
        function (e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
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

function generateToken(docs, callback) {
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
            devices.updateOne({ device_id: payload.device_id }, { $set: payload }, function (err) {
                if (err) callback(err, null)
            })
            callback(null, token)
        }
    })
}