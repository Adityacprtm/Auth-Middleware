(function () {
    module.exports = (app) => {
        const logger = app.helpers.winston
        return (server) => {
            console.log('server')
            server.on('clientConnected', function (client) {
                logger.mqtt('client connected', client.id);
            });

            // fired when a message is received
            server.on('published', function (packet, client) {
                logger.mqtt('Published', packet.payload);
            });
        }
    }
}).call(this)