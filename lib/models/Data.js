(function () {
    const KEYS_SET_NAME = 'topics'

    module.exports = (app) => {
        var Data, buildKey
        buildKey = (key) => 'topic:' + key

        Data = (function () {
            function Data(key_, value_) {
                this.key = key_
                this.value = value_
                this.value || (this.value = null)
            }

            Object.defineProperty(Data.prototype, 'key', {
                enumerable: true,
                configurable: false,
                get: function () {
                    return this._key
                },
                set: function (key) {
                    this.redisKey = buildKey(key)
                    this._key = key
                    return this._key
                }
            })

            Object.defineProperty(Data.prototype, 'jsonValue', {
                configurable: false,
                enumerable: true,
                get: function () {
                    return JSON.stringify(this.value)
                },
                set: function (val) {
                    this.value = JSON.parse(val)
                    return this.value
                }
            })

            Data.prototype.save = function (callback) {
                app.redis.client.set(this.redisKey, this.jsonValue, ((_this) => {
                    return (err) => {
                        return app.ascoltatore.publish(_this.key, _this.value, () => {
                            if (callback != null) {
                                return callback(err, _this)
                            }
                        })
                    }
                })(this))
                return app.redis.client.sadd(KEYS_SET_NAME, this.key)
            }
            return Data
        })()

        Data.findOrCreate = () => {
            var args, arg, key, value, callback
            args = Array.prototype.slice.call(arguments)
            key = args.shift()
            arg = args.shift()
            if (typeof arg === 'function') {
                callback = arg
            } else {
                value = arg
                callback = args.shift()
            }
            app.redis.client.get(buildKey(key), (err, oldValue) => {
                if (err) console.log(err)
                var data
                data = Data.fromRedis(key, oldValue)
                if (value != null) {
                    data.value = value
                }
                return data.save(callback)
            })
            return Data
        }

        Data.fromRedis = (topic, value) => {
            var data
            data = new Data(topic)
            data.jsonValue = value
            return data
        }
        return Data
    }
}).call(this)