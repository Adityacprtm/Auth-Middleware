(function () {
    module.exports = (app) => {
        const Data = app.models.Data
        const logger = app.helpers.winston

        return function (client) {
            let self = this
            if (!self.clients) self.clients = {}

            client.on('connect', (packet) => {
                var authorized = (packet.username === 'alice' && packet.password.toString() === 'secret');
                if (authorized) {
                    client.user = packet.username
                    self.clients[packet.clientId] = client
                    client.id = packet.clientId
                    client.subscriptions = []
                    client.connack({
                        returnCode: 0
                    })
                    logger.mqtt('client %s (%s) has connected', client.id, client.user);
                } else {
                    client.connack({
                        returnCode: 2
                    })
                    logger.mqtt('client %s has refused', client.id)
                }
            });

            client.on('publish', (packet) => {
                logger.mqtt('Client %s publish a message to %s', client.id, packet.topic)
                return Data.findOrCreate(packet.topic, packet.payload)
            });

            client.on('subscribe', (packet) => {
                let granted, result, stringValue

                granted = []

                for (let i = 0; i < packet.subscriptions.length; i++) {
                    let qos = packet.subscriptions[i].qos
                    let topic = packet.subscriptions[i].topic
                    let reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$')
                    granted.push(qos)
                    client.subscriptions.push(reg)
                    client.suback({
                        messageId: packet.messageId,
                        granted: granted
                    })

                    result = []
                    for (let i = 0, len = client.subscriptions.length; i < len; i++) {
                        result.push(function () {
                            let listener
                            listener = (data) => {
                                try {
                                    console.log('1')
                                    stringValue = (data.value && data.value.type === 'Buffer') ?
                                        new Buffer(data.value).toString() :
                                        data.value.toString()
                                    return client.publish({
                                        topic: data.key,
                                        payload: stringValue
                                    })
                                } catch (err) {
                                    logger.error('There\'s an error: %s', err)
                                    return client.close()
                                }
                            }

                            Data.subscribe(topic, listener)
                        }())
                    }
                    logger.mqtt('Client %s subscribe to %s', client.id, topic)
                }
                return result
            });

            client.on('pingreq', () => {
                logger.mqtt(' Ping from %s', client.id)
                client.pingresp()
            })

            client.on('disconnect', () => {
                logger.mqtt('Client %s has disconnected', client.id)
                client.stream.end()
            });

            client.on('error', (error) => {
                logger.error('Client %s got an error : %s', 'ERROR', error)
                client.stream.end()
            });

            client.on('close', (error) => {
                if (error) logger.error(error)
                logger.mqtt('Client %s has closed connection', client.id)
            });

            return client.on('unsubscribe', (packet) => {
                logger.mqtt('Client [%s] has unsubscribed', client.id)
                return client.unsuback({
                    messageId: packet.messageId
                })
            })
        }
    }
}).call(this)