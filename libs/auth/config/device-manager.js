const jwt = require('jsonwebtoken')
const uniqid = require('uniqid')
const MongoClient = require('mongodb').MongoClient;
const SECRET_KEY = 'supersecret',
    EXP_TIME = '1m',
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
    devices.findOne({ device_id: payload.device_id, password: payload.password }, function (err, docs) {
        if (err) { callback(err, null) }
        if (docs) {
            if (docs.token) {
                checkToken(docs.token, (err, reply) => {
                    if (err) {
                        if (err.name == "TokenExpiredError") {
                            docs.ip = payload.ip
                            docs.timestamp = payload.timestamp
                            generateToken(docs, (err, token) => {
                                if (err != null) { callback(err, null) }
                                else { callback(null, token) }
                            })
                        }
                    }
                    else {
                        callback('Already has token', null)
                    }
                })
            } else {
                docs.ip = payload.ip
                docs.timestamp = payload.timestamp
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
            callback(null, { 'status': true, 'data': reply })
        }
    })
}

exports.addDevice = function (dataDevice, callback) {
    var tempId
    devices.findOne({ device_name: dataDevice.device_name, user: dataDevice.user }, function (err, rep) {
        if (rep) {
            callback('device-name-taken')
        } else {
            tempId = uniqid.process()
            devices.findOne({ device_id: tempId }, (err, rep) => {
                if (err) { callback(err) }
                if (rep) {
                    dataDevice.device_id = uniqid.process()
                } else {
                    dataDevice.device_id = tempId
                }
                dataDevice.password = uniqid.time()
                devices.insertOne(dataDevice, (err, r) => {
                    if (err) { callback(err) }
                    else { callback(null) }
                })
            })
        }
    })
}

exports.updateDevice = function (newData, callback) {
    var data = {
        role: newData.role,
        description: newData.description
    }
    devices.findOneAndUpdate({ device_id: newData.device_id }, { $set: data }, { returnOriginal: false }, callback)
}

exports.checkId = function (id, callback) {
    devices.findOne({ device_id: id }, (err, rep) => {
        if (rep) { callback(null, rep) }
        else { callback(err, null) }
    })
}

exports.getDevice = function (user, callback) {
    devices.find({ user: user }).toArray(
        function (e, res) {
            if (e) callback(e)
            else callback(null, res)
        });
}

exports.deleteDevice = function (id, user, callback) {
    if (id != null) {
        devices.deleteOne({ device_id: id }, callback)
    } else if (user != null) {
        devices.deleteOne({ user: user }, callback)
    }
}

exports.saveTopic = function (device_id, topic) {
    devices.findOneAndUpdate({ device_id: device_id }, { $set: { topic: topic } }, { returnOriginal: false })
}

exports.deleteTopic = function (device_id) {
    devices.findOneAndUpdate({ device_id: device_id }, { $set: { topic: null } }, { returnOriginal: false })
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
            docs.token = token
            devices.updateOne({ device_id: payload.device_id }, { $set: docs }, function (err) {
                if (err) callback(err, null)
            })
            callback(null, token)
        }
    })
}