(function () {

    module.exports = (app) => {

        const logger = app.helpers.winston
        const Data = app.models.Data
        // const authDevice = require('../models/dummy_auth_device')
        const authDevice = require('.././models/dummy_auth_device.json')
        const authUser = require('.././models/dummy_auth_user.json')
        const device = require('.././models/dummy_device.json')
        // const user = require('../models/dummy_user')
        const crypto = require('crypto');
        const fs = require('fs')

        return (req, res) => {

            const url = req.url;
            const authorization = req.headers['authorization'];

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
                        payload.ip = req.socket.localAddress
                        payload.timstamp = Date.now()
                        var auth = device.find(element => element.id == payload.id && element.mac == payload.mac)

                        if (auth) {
                            Data.request(payload, (err, data) => {
                                if (err != null) {
                                    sendResponse(406, {
                                        message: err
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
                        var payload, timestamp, hashUsername, hashPassword, temp
                        payload = JSON.parse(data)
                        timestamp = Date.now().toString()
                        hashUsername = crypto.createHmac('sha1', 'secret')
                            .update(timestamp)
                            .digest('hex')
                        hashPassword = crypto.createHmac('md5', 'secret')
                            .update(timestamp)
                            .digest('hex')
                        temp = {
                            username: hashUsername,
                            password: hashPassword
                        }
                        authDevice.push(temp)
                        device.push(payload.device)
                        fs.writeFileSync(__dirname + "/../models/dummy_device.json", JSON.stringify(device, null, 4))
                        fs.writeFileSync(__dirname + "/../models/dummy_auth_device.json", JSON.stringify(authDevice, null, 4))

                        logger.http('User %s added new device %s', payload.username, payload.device.device)

                        sendResponse(201, {
                            message: 'Created',
                            data: temp
                        })
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

            if (!authorization) {
                sendResponse(401, {
                    message: 'Need authorization'
                })
            } else {
                var tmp, creds, username, password, auth
                tmp = authorization.split(' ')[1];

                var buf = new Buffer.from(tmp, 'base64');
                var plain_auth = buf.toString();

                creds = plain_auth.split(':');
                username = creds[0];
                password = creds[1];

                if (req.url == "/") {
                    auth = authDevice.find(element => username == element.username && password == element.password)
                } else if (req.url == "/admin/login") {
                    auth = authUser.find(element => username == element.username && password == element.password)
                }

                if (auth) {
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
                    logger.http('Server has refused, client %s identity rejected', req.socket.localAddress)
                }
            }
        }
    }
}).call(this)