(function () {
    module.exports = (app) => {
        const logger = app.helpers.winston
        return io.on('connection', (socket) => {

            logger.socket('Client %s has connected', socket.id)

            socket.on('subscribe', function (topic) {
                logger.socket('Client %s subscribe to %s ', socket.id, topic.topic)
                
                socket.emit('/r/', topic)
            });

            return socket.on('disconnect', () => {
                logger.socket('Client %s has disconnected', socket.id)
            })
        })
    }
}).call(this)