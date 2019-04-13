module.exports = (app) => {

    const dataAuth = require('../auth/models/Mongo')
    const logger = app.helpers.winston
    const Data = app.models.Data

    return function (client) {
        let self = this
        if (!self.clients) self.clients = {}

        client.on('connect', (packet) => {
            var token, authorized
            token = packet.username
            client.user = packet.username
            self.clients[packet.clientId] = client
            client.id = packet.clientId
            client.subscriptions = []

            dataAuth.validity(token, (err, reply) => {
                if (err != null) {
                    logger.error('There\'s an error: %s', err)
                    client.connack({
                        returnCode: 5
                    })
                } else {
                    authorized = reply
                    if (authorized) {
                        client.connack({
                            returnCode: 0
                        })
                        logger.mqtt('client %s has connected', client.id);
                    } else {
                        client.connack({
                            returnCode: 2
                        })
                        logger.mqtt('client %s has refused, identifier rejected', client.id)
                    }
                }
            })
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
                        return Data.find('topics', client.subscriptions[i], (err, data) => {
                            if (err != null) {
                                logger.error('There\'s an error: %s', err)
                            } else {
                                return listener(data)
                            }
                        })
                    }())
                }
                logger.mqtt('Client %s subscribe to %s', client.id, topic)
            }
            return result
        });

        client.on('pingreq', () => {
            logger.mqtt('Ping from %s', client.id)
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
            delete self.clients[client.id]
        });

        return client.on('unsubscribe', (packet) => {
            logger.mqtt('Client [%s] has unsubscribed', client.id)
            return client.unsuback({
                messageId: packet.messageId
            })
        })
    }
}