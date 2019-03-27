(function () {

    module.exports = (app) => {

        const logger = app.helpers.winston
        const Data = app.models.Data
        const authDevice = require('../models/dummy_auth_device')
        const device = require('../models/dummy_device')
        const user = require('../models/dummy_user')

        return (req, res) => {

            const url = req.url;
            const auth = req.headers['authorization'];

            const sendResponse = (code, payload) => {
                if (code == '401') {
                    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
                }
                res.writeHead(code, {
                    'Content-Type': 'text/plain'
                })
                res.end(JSON.stringify(payload))
            }

            const handlerPost = () => {
                if (url == '/') {
                    logger.http('Incoming Client %s request token from %s ', req.method, req.socket.localAddress)
                    req.on('data', function (data) {
                        const payload = JSON.parse(data)
                        if (device.id === payload.id && device.mac === payload.mac) {
                            Data.request(payload, (err, data) => {
                                if (err != null) {
                                    sendResponse(406, {
                                        message: data
                                    })
                                    logger.http('Not generate token for %s, already has token', req.socket.localAddress)
                                } else {
                                    sendResponse(200, {
                                        message: "Created",
                                        token: data
                                    })
                                    logger.http('Token generated for %s', req.socket.localAddress)
                                }
                            })
                        } else {
                            sendResponse(401, {
                                message: "Unauthorized"
                            })
                            logger.http('Server has refused, client %s identity rejected', req.socket.localAddress)
                        }
                    });
                } else if (url == '/admin/login') {
                    logger.http('Incoming User %s request from %s', req.method, req.socket.localAddress)
                    req.on('data', function (data) {
                        const payload = JSON.parse(data)
                        if (user.username == payload.username) {
                            sendResponse(200, {
                                message: 'Welcome ' + payload.username
                            })
                            logger.http('User %s added new device %s', payload.username, payload.device.device)
                        } else {
                            sendResponse(401, {
                                message: "Unauthorized"
                            })
                            logger.http('Server has refused, client %s identity rejected', req.socket.localAddress)
                        }
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

            if (!auth) {
                sendResponse(401, {
                    message: 'Need authorization'
                })
            } else {
                var tmp = auth.split(' ')[1];

                // var buf = new Buffer(tmp[1], 'base64');
                // var plain_auth = buf.toString();

                var creds = tmp.split(':');
                var username = creds[0];
                var password = creds[1];

                if ((username == authDevice.username) && (password == authDevice.password)) {
                    switch (req.method) {
                        case 'POST':
                            handlerPost()
                            break
                        default:
                            handlerOther()
                            break
                    }
                } else {
                    sendResponse(401, {
                        message: 'You shall not pass'
                    })
                }
            }
        }
    }
}).call(this)