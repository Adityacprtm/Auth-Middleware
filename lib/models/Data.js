(function () {

    const KEYS_SET_NAME = 'topics'

    module.exports = (app) => {
        var Data, buildKey

        buildKey = (key) => 'topics:' + key

        Data = (function () {
            function Data(key_, value_) {
                this.redisKey = buildKey(key_)
                this.key = key_
                this.value = value_
                this.value || (this.value = null)
            }

            Data.prototype.save = function () {
                app.redis.client.set(this.redisKey, this.value, ((_this) => {
                    return app.ascoltatore.publish(_this.key, _this.value)
                })(this))
                return app.redis.client.sadd(KEYS_SET_NAME, this.key)
            }
            return Data
        })()

        Data.find = function (pattern, callback) {
            var foundRecord
            foundRecord = (key) => {
                return app.redis.client.get(buildKey(key), (err, value) => {
                    if (err) {
                        if (callback != null) {
                            callback(err)
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
                        return callback(null, Data.fromRedis(key, value))
                    }
                })
            }
            if (pattern.constructor !== RegExp) {
                foundRecord(pattern)
            } else {
                app.redis.client.smembers(KEYS_SET_NAME, (err, topics) => {
                    if (err) console.log(err)
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
            app.redis.client.get(buildKey(key), (err, oldValue) => {
                if (err) console.log(err)
                var data
                data = Data.fromRedis(key, oldValue)
                if (value != null) {
                    data.value = value
                }
                return data.save()
            })
            return Data
        }

        Data.fromRedis = function (topic, value) {
            var data
            data = new Data(topic, value)
            data.value = value
            return data
        }

        Data.subscribe = function (topic, callback) {
            callback._subscriber = (actualTopic, value) => callback(new Data(actualTopic, value))
            app.ascoltatore.subscribe(topic, callback._subscriber)
            return this
        }

        Data.unsubscribe = function (topic, callback) {
            app.ascoltatore.unsubscribe(topic, callback._subscriber)
            return this
        }

        Data.request = function () {
            return this
        }

        return Data
    }
}).call(this)