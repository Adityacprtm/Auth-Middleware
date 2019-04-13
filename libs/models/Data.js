(function () {

    var jwt = require('jsonwebtoken')
    var SECRET_KEY = 'secret'

    module.exports = (app) => {
        var Data, buildKey

        buildKey = (type, key) => type + ':' + key

        Data = (function () {
            function Data(type_, key_, value_) {
                this.redisKey = buildKey(type_, key_)
                this.key = key_
                this.value = value_
                this.value || (this.value = null)
            }

            Data.prototype.save = function (type) {
                if (type == "devices") {
                    app.redis.client.set(this.redisKey, this.value)
                } else {
                    app.redis.client.set(this.redisKey, this.value, ((_this) => {
                        return app.ascoltatore.publish(_this.key, _this.value)
                    })(this))
                }
                return app.redis.client.sadd(type, this.key)
            }
            return Data
        })()

        Data.find = function (type, pattern, callback) {
            var foundRecord
            foundRecord = (key) => {
                return app.redis.client.get(buildKey(type, key), (err, value) => {
                    if (err) {
                        if (callback != null) {
                            callback(err, null)
                        }
                        return
                    }
                    if (value == null) {
                        if (callback != null) {
                            callback('Record not found', null)
                        }
                        return
                    }
                    if (callback != null) {
                        return callback(null, Data.fromRedis(type, key, value))
                    }
                })
            }
            if (pattern.constructor !== RegExp) {
                foundRecord(pattern)
            } else {
                app.redis.client.smembers(type, (err, topics) => {
                    if (err != null) {
                        callback(err, null)
                    }
                    var i, len, results, topic
                    results = []
                    for (i = 0, len = topics.length; i < len; i++) {
                        topic = topics[i]
                        if (pattern.test(topic)) {
                            results.push(foundRecord(topic))
                        } else {
                            results.push(void 0)
                        }
                    }
                    return results
                })
            }
            return Data
        }

        Data.findOrCreate = function () {
            var args, key, value
            args = Array.prototype.slice.call(arguments)
            key = args.shift()
            value = args.shift()
            app.redis.client.get(buildKey('topics', key), (err, oldValue) => {
                if (err) console.log(err)
                var data
                data = Data.fromRedis('topics', key, oldValue)
                if (value != null) {
                    data.value = value
                }
                return data.save('topics')
            })
            return Data
        }

        Data.fromRedis = function (type, key, value) {
            var data
            data = new Data(type, key, value)
            data.value = value
            return data
        }

        Data.subscribe = function (topic, callback) {
            callback._subscriber = (actualTopic, value) => callback(new Data('topics', actualTopic, value))
            app.ascoltatore.subscribe(topic, callback._subscriber)
            return this
        }

        Data.unsubscribe = function (topic, callback) {
            app.ascoltatore.unsubscribe(topic, callback._subscriber)
            return this
        }

        Data.request = function (payload, callback) {
            var deviceId, expiration, token, data
            deviceId = payload.id
            expiration = {
                expiresIn: '1h'
            }
            app.redis.client.smembers('devices', (err, devices) => {
                if (err != null) {
                    callback(err, null)
                    return
                }
                var i, len
                len = devices.length

                // Find device Find 
                var deviceMatch = devices.find(elements => elements == deviceId)
                if (deviceMatch) {
                    app.redis.client.get(buildKey('devices', deviceMatch), (err, replies) => {
                        if (err) callback(err, null)
                        jwt.verify(replies, SECRET_KEY, (err) => {
                            if (err) {
                                if (err.name == "TokenExpiredError") {
                                    token = jwt.sign(payload, SECRET_KEY, expiration)
                                    data = Data.fromRedis('devices', deviceMatch, token)
                                    data.save('devices')
                                    callback(null, token)
                                } else {
                                    callback(JSON.stringify(err), null)
                                }
                            } else {
                                callback('Already has token', null)
                            }
                        })
                    })
                } else {
                    token = jwt.sign(payload, SECRET_KEY, expiration)
                    data = Data.fromRedis('devices', deviceId, token)
                    data.save('devices')
                    callback(null, token)
                }

                // Find device For loop
                if (len == 0) len += 1
                for (i = 0; i < len; i++) {
                    if (deviceId == devices[i]) {
                        app.redis.client.get(buildKey('devices', deviceId), (err, replies) => {
                            if (err != null) {
                                callback(err, null)
                            }
                            jwt.verify(replies, SECRET_KEY, (err, decoded) => {
                                if (err) {
                                    if (err.name == "TokenExpiredError") {
                                        token = jwt.sign(payload, SECRET_KEY, expiration)
                                        data = Data.fromRedis('devices', deviceId, token)
                                        data.save('devices')
                                        callback(null, token)
                                    } else {
                                        callback(JSON.stringify(err), null)
                                    }
                                } else {
                                    callback('Already has token', null)
                                }
                            })
                        })
                    } else {
                        token = jwt.sign(payload, SECRET_KEY, expiration)
                        data = Data.fromRedis('devices', deviceId, token)
                        data.save('devices')
                        callback(null, token)
                    }
                }
            })
            return this
        }

        Data.validity = function (token, callback) {
            var deviceId, decoded
            try {
                decoded = jwt.verify(token, SECRET_KEY)
                deviceId = decoded.id
            } catch (error) {
                callback(true, error)
                return
            }
            Data.find('devices', deviceId, (err, data) => {
                if (err != null) {
                    callback(true, JSON.stringify(err))
                    return
                } else {
                    if (token == data.value) {
                        callback(null, true)
                    } else {
                        callback(null, false)
                    }
                }
            })
            return this
        }

        return Data
    }
}).call(this)