(function () {

    module.exports = (app) => {
        const logger = app.helpers.winston
        const Data = app.models.Data

        return (req, res) => {
            const sendResponse = (code, payload) => {
                res.code = code
                res.end(JSON.stringify(payload))
            }

            const handlerPost = () => {
                if (/^\/r\/(.+)$/.exec(req.url) === null) {
                    return sendResponse('4.00', {
                        message: 'Bad Request'
                    })
                }

                const topic = /^\/r\/(.+)$/.exec(req.url)[1]
                Data.findOrCreate(topic, req.payload)
                sendResponse('2.01', {
                    message: 'Created'
                })
                logger.coap('Incoming %s request from %s for topic %s ', req.method, req.rsinfo.address, topic)
            }

            const handlerOther = () => {
                logger.coap('Incoming %s request from %s', req.method, req.rsinfo.address)
                sendResponse('4.05', {
                    message: 'Method Not Allowed'
                })
            }

            const handlerGet = function () {
                if (/^\/r\/(.+)$/.exec(req.url) === null) {
                    sendResponse('4.04', {
                        message: 'not found'
                    })
                    return
                }

                let topic = /^\/r\/(.+)$/.exec(req.url)[1]

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
                            logger.error(' There\'s an error: %s', err.toLowerCase())
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

                Data.find(topic, function (err, data) {
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
}).call(this)