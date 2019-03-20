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

        Data.findOrCreate = function () {
            var args, key, arg, value
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
            console.log('2')
            callback._subscriber = (actualTopic, value) => callback(new Data(actualTopic, value))
        }

        return Data
    }
}).call(this)