var jwt = require('jsonwebtoken')
let mongoose = require('mongoose')
const SECRET_KEY = 'supersecret'

let deviceSchema = mongoose.Schema({
    id: Number,
    device_name: String,
    description: String,
    role: String,
    ip: String,
    timestamp: Number,
    token: String,
    user: String
})

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

function generateToken(payload, Models, callback) {
    // token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5m' })
    jwt.sign(payload, SECRET_KEY, { expiresIn: '1m' }, (err, token) => {
        if (err) {
            callback(err.name, null)
        } else {
            payload['token'] = token
            Models.updateOne({ 'id': payload.id }, payload, function (err) {
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
    Models.find({ 'id': payload.id }, function (err, docs) {
        if (err) { callback(err, null) }
        if (docs[0].token) {
            checkToken(docs[0].token, (err, reply) => {
                if (err != null) {
                    generateToken(payload, Models, (err, token) => {
                        if (err != null) { callback(err, null) }
                        else { callback(null, token) }
                    })
                }
                else {
                    callback('Already has token', null)
                }
            })
        } else {
            generateToken(payload, Models, (err, token) => {
                if (err != null) { callback(err, null) }
                else { callback(null, token) }
            })
        }
    })
}

exports.validity = function (token, callback) {
    connect()
    checkToken(token, (err, reply) => {
        if (err != null) { callback(err, false) }
        else { callback(null, true) }
    })
}

exports.check_user = function (data_user, callback) {
    connect()
    var Models
    Models = mongoose.model('users', userSchema)
    Models.findOne({ 'username': data_user.username, 'password': data_user.password }, function (err, entities) {
        if (err) { callback(err, null) }
        else {
            if (entities) {
                if (entities.username == data_user.username && entities.password == data_user.password) {
                    callback(null, true)
                } else {
                    callback(null, false)
                }
            } else {
                callback(null, false)
            }
        }
    })
}

exports.device_handler = function (data_device, callback) {
    connect()
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
    // connMongo = function (data, cmd, callback) {
    //     MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
    //         if (err) throw err;
    //         if (cmd === "insertOne") {
    //             var dbo = db.db("mydb");
    //             var myobj = { username: data.username, password: data.password };
    //             dbo.collection("users").insertOne(myobj, function (err, res) {
    //                 if (err) throw err;
    //                 callback("Successful Insert !")
    //                 db.close();
    //             });
    //         }
    //     })
    // }

    // exports.request = function (payload, callback) {
    //     MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    //         if (err) callback(err, null);
    //         var dbo, query, token
    //         dbo = db.db(DB);
    //         query = { _id: payload._id };
    //         dbo.collection("devices").find(query).toArray(function (err, result) {
    //             if (err) callback(err, null);
    //             if (result) {
    //                 token = result[0].token
    //                 if (token) {
    //                     if (checkToken(token)[0]) {
    //                         console.log(payload)
    //                         handlerToken(db, query, payload, callback)
    //                     } else {
    //                         callback('Already has token', null)
    //                     }
    //                 } else {
    //                     handlerToken(db, query, payload, callback)
    //                 }
    //             }
    //             db.close();
    //         });
    //     });
    // }

    // exports.validity = function (token, callback) {
    //     var dbo, deviceId, query, decoded
    //     try {
    //         decoded = jwt.verify(token, SECRET_KEY)
    //         deviceId = decoded._id
    //     } catch (error) {
    //         callback(error.name, null)
    //         return
    //     }
    //     MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
    //         if (err) callback(err, null);
    //         dbo = db.db(DB)
    //         query = { _id: deviceId }
    //         dbo.collection('devices').find(query).toArray(function (err, result) {
    //             if (err != null) {
    //                 callback(err, null)
    //             } else {
    //                 if (token === result[0].token) {
    //                     callback(null, "true")
    //                 } else {
    //                     callback(null, "false")
    //                 }
    //             }
    //             db.close()
    //         })
    //         db.close()
    //     })
    // }

    // function handlerToken(db, query, payload, callback) {
    //     var token, myobj, dbo
    //     dbo = db.db(DB);
    //     token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5m' })
    //     payload.token = token
    //     myobj = { $set: payload }
    //     dbo.collection("devices").updateOne(query, myobj, function (err, res) {
    //         if (err) callback(err, null);
    //         callback(null, token)
    //         db.close();
    //     });
    // }

    // function checkToken(token) {
    //     var status = []
    //     jwt.verify(token, SECRET_KEY, (err, decoded) => {
    //         if (err) {
    //             status.push(true)
    //         } else {
    //             status.push(false)
    //         }
    //     })
    //     return status
    // }