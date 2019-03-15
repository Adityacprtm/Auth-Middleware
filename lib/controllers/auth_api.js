(function () {
    module.exports = (app) => {

        const jwt = require('jsonwebtoken');
        const logger = app.helpers.winston

        return (req, res) => {
            const sendResponse = (code, payload) => {
                res.code = code
                res.end(JSON.stringify(payload))
            }

            const handlerPost = () => {
                logger.http('Incoming %s request token from %s ', req.method, req.socket.localAddress)
                req.on('data', function (data) {
                    const payload = {
                        id: JSON.parse(data).id,
                        device: JSON.parse(data).device,
                        timestamp: JSON.parse(data).timestamp,
                        ip: JSON.parse(data).ip,
                        mac: JSON.parse(data).mac,
                        secret: JSON.parse(data).secret
                    }
                    
                    // cek client id dan client secret

                    const token = jwt.sign(payload, payload.secret, {
                        expiresIn: '1day'
                    });

                    // simpan token

                    logger.http('Sending token to %s', req.socket.localAddress)
                    sendResponse('2.01', {
                        message: 'Created',
                        token: token
                    })
                });
            }

            const handlerOther = () => {
                logger.http('Incoming %s request token from %s ', req.method, req.socket.localAddress)
                sendResponse('4.05', {
                    message: 'Not supported'
                })
            }

            switch (req.method) {
                case 'POST':
                    handlerPost()
                    break
                default:
                    handlerOther()
                    break
            }
        }
    }
}).call(this)