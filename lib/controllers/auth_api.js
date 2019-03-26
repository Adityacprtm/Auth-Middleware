(function () {

    module.exports = (app) => {

        const logger = app.helpers.winston
        const device = require('../models/dummy_device');
        const user = require('../models/dummy_user')
        const Data = app.models.Data

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
                        const payload = JSON.parse(data)
                        if (device.id === payload.id && device.secret === payload.secret) {
                            const token = Data.request(payload)
                            sendResponse(200, {
                                message: "Created",
                                token: token
                            })
                            logger.http('Token generated for %s', req.socket.localAddress)
                        } else {
                            sendResponse(400, {
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
                            sendResponse(400, {
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