module.exports = (app) => {

    const logger = app.helpers.winston
    const Data = app.models.Data
    const dataAuth = require('../auth/models/Mongo')
    const url = require('url');

    return (req, res) => {

        const sendResponse = (code, payload) => {
            res.code = code
            res.end(JSON.stringify(payload))
        }

        const handlerPost = () => {
            var modUrl, topic, token, authorized

            if (/^\/r\/(.+)$/.exec(req.url) === null) {
                return sendResponse('4.00', {
                    message: 'Bad Request'
                })
            }

            modUrl = req.url.split('?')[0]
            topic = /^\/r\/(.+)$/.exec(modUrl)[1]
            token = url.parse(req.url, true).query.token;
            // logger.coap('Client from %s Connecting . . .', req.rsinfo.address)
            dataAuth.validity(token, (err, reply) => {
                if (err != null) {
                    logger.error('There\'s an error: %s', err)
                    sendResponse('5.00', {
                        message: 'Internal Server Error',
                        additional: err.toString()
                    })
                } else {
                    authorized = reply
                    if (authorized) {
                        Data.findOrCreate(topic, req.payload)
                        logger.coap('Incoming %s request from %s for topic %s ', req.method, req.rsinfo.address, topic)
                        sendResponse('2.01', {
                            message: 'Created'
                        })
                    } else {
                        logger.coap('Server has refused, client %s identity rejected', req.rsinfo.address)
                        sendResponse('4.01', {
                            message: 'Unauthorized'
                        })
                    }
                }
            })
        }

        const handlerGet = () => {
            var modUrl, topic, token, authorized

            if (/^\/r\/(.+)$/.exec(req.url) === null) {
                sendResponse('4.04', {
                    message: 'not found'
                })
                return
            }

            modUrl = req.url.split('?')[0]
            topic = /^\/r\/(.+)$/.exec(modUrl)[1]
            token = url.parse(req.url, true).query.token;
            // logger.coap('Client from %s Connecting . . .', req.rsinfo.address)
            Data.validity(token, (err, reply) => {
                if (err != null) {
                    logger.error('There\'s an error: %s', err)
                    sendResponse('5.00', {
                        message: 'Internal Server Error',
                        additional: err.toString()
                    })
                } else {
                    authorized = reply
                    if (authorized) {
                        logger.coap('Incoming %s request from %s for %s ', req.method, req.rsinfo.address, topic)
                        var handlerObserver = function (payload) {
                            let listener = function (data) {
                                try {
                                    let stringValue = (data.value && data.value.type === 'Buffer') ?
                                        new Buffer(data.value).toString() :
                                        data.value.toString()
                                    res.write(JSON.stringify({
                                        topic: topic,
                                        payload: stringValue
                                    }))
                                } catch (err) {
                                    logger.error('There\'s an error: %s', err.toLowerCase())
                                }
                            }

                            res.write(JSON.stringify(payload))
                            Data.subscribe(topic, listener)

                            res.on('finish', function (err) {
                                if (err)
                                    if (err) logger.error(err)
                                res.reset()
                            })
                        }

                        Data.find('topics', topic, function (err, data) {
                            if (err != null || data == null) {
                                sendResponse('4.04', {
                                    message: 'not found'
                                })
                            } else {
                                let stringValue = (data.value && data.value.type === 'Buffer') ?
                                    new Buffer(data.value).toString() :
                                    data.value
                                if (req.headers['Observe'] !== 0) {
                                    sendResponse('2.05', {
                                        topic: topic,
                                        payload: stringValue
                                    })
                                } else {
                                    handlerObserver({
                                        topic: topic,
                                        payload: stringValue
                                    })
                                }
                            }
                        })
                    } else {
                        sendResponse('4.01', {
                            message: 'Unauthorized'
                        })
                        logger.coap('Server has refused, client %s identity rejected', req.rsinfo.address)
                    }
                }
            })
        }

        const handlerOther = () => {
            logger.coap('Incoming %s request from %s', req.method, req.rsinfo.address)
            sendResponse('4.05', {
                message: 'Method Not Allowed'
            })
        }

        switch (req.method) {
            case 'POST':
                handlerPost()
                break
            case 'GET':
                handlerGet()
                break
            default:
                handlerOther()
                break
        }
    }
}