(function () {
    module.exports = (app) => {

        const jwt = require('jsonwebtoken');
        const logger = app.helpers.winston

        return (req, res) => {
            const url = req.url;

            const sendResponse = (code, payload) => {
                res.writeHead(code, {
                    'Content-Type': 'text/plain'
                })
                res.end(JSON.stringify(payload))
            }

            const handlerPost = () => {
                if (url == '/') {
                    logger.http('Incoming Client %s request token from %s ', req.method, req.socket.localAddress)
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
                        sendResponse(200, {
                            message: 'Created',
                            token: token
                        })
                    });
                } else if (url == '/admin/login') {
                    logger.http('Incoming Admin %s request from %s', req.method, req.socket.localAddress)
                    sendResponse(200, {
                        message: 'welcome admin'
                    })
                } else {
                    logger.http('Incoming %s request to %s from %s', req.method, url, req.socket.localAddress)
                    sendResponse(404, {
                        message: 'Not Found'
                    })
                }
            }

            const handlerOther = () => {
                logger.http('Incoming %s request from %s ', req.method, req.socket.localAddress)
                sendResponse(405, {
                    message: 'Method Not Allowed'
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