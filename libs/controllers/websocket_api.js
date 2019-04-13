(function () {

    module.exports = (app) => {

        const logger = app.helpers.winston
        const Data = app.models.Data

        return io.on('connection', (socket) => {
            var token, authorized, subscriptions, subscription

            if (socket.handshake.query && socket.handshake.query.token) {
                token = socket.handshake.query.token

                logger.socket('Client %s connecting . . .', socket.id)
                Data.validity(token, (err, reply) => {
                    if (err != null) {
                        logger.error('There\'s an error: %s', err)
                        socket.emit('jwtMsg', err.message)
                        socket.disconnect()
                    } else {
                        authorized = reply
                        if (authorized) {
                            logger.socket('Client %s has connected', socket.id)
                            subscriptions = {}
                            socket.on('subscribe', (topic) => {
                                logger.socket('Client %s subscribe to %s ', socket.id, topic)
                                subscription = (currentData) => {
                                    let stringValue = null
                                    if (currentData.value.type === 'Buffer' || currentData.value instanceof Buffer) {
                                        stringValue = new Buffer(currentData.value).toString()
                                    } else {
                                        stringValue = currentData.value
                                    }
                                    return socket.emit('/r/' + topic, stringValue)
                                }
                                subscriptions[topic] = subscription
                                Data.subscribe(topic, subscription)
                                return Data.find('topics', topic, (err, data) => {
                                    if (err) logger.error(err)
                                    if ((data != null ? data.value : void 0) != null) {
                                        return subscription(data)
                                    }
                                })
                            });
                        } else {
                            logger.socket('Client %s has refused', socket.id)
                            socket.disconnect()
                        }
                    }
                })
            }

            return socket.on('disconnect', () => {
                logger.socket('Client %s has disconnected', socket.id)
                let listener, results, topic
                results = []
                for (topic in subscriptions) {
                    listener = subscriptions[topic]
                    results.push(Data.unsubscribe(topic, listener))
                }
                return results
            })
        })
    }
}).call(this)