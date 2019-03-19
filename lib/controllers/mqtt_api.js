(function () {
    module.exports = (app) => {
        const Data = app.models.Data
        const logger = app.helpers.winston

        return (client) => {
            let self = this
            if (!self.clients) self.clients = {}
            
            client.on('connect', (packet) => {
                client.id = packet.clientId
                var authorized = (packet.username === 'alice' && packet.password.toString() === 'secret');
                if (authorized) {
                    client.user = packet.username;
                    client.connack({
                        returnCode: 0
                    })
                    logger.mqtt('client %s has connected', client.id);
                } else {
                    client.connack({
                        returnCode: 2
                    })
                    logger.mqtt('client %s has refused', client.id)
                }
            });

            client.on('disconnect', (packet) => {
                logger.mqtt('Client %s has disconnected', client.id)
                client.stream.end()
            });

            client.on('error', (error) => {
                logger.error('Client %s got an error : %s', 'ERROR', error)
                client.stream.end()
            });

            client.on('close', (err) => {
                if (err) logger.error(err)
                logger.mqtt('Client %s has closed connection', client.id)
            });

            client.on('publish', (packet) => {
                logger.mqtt('Client %s publish a message to %s', client.id, packet.topic)
                console.log(packet.topic)
                console.log(packet.payload)
                return Data.findOrCreate(packet.topic, packet.payload)
            });

            client.on('subscribe', (packet) => {
                logger.mqtt('Client %s subscribe to %s', client.id, packet.topic)
            });
        }
    }
}).call(this)