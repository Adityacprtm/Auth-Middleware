module.exports = (app) => {
    const logger = app.helpers.winston
    const auth = require('../auth/controller')

    return (req, res) => {

        // get path url
        const url = req.url;

        // handle sending response
        const sendResponse = (code, payload) => {
            if (code == '401') {
                res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            }
            res.writeHead(code, { 'Content-Type': 'text/html' })
            res.end(payload)
        }

        // handler for POST method
        const handlerPost = () => {
            if (url == '/request') {
                logger.http('Incoming Device for %s request token from %s ', req.method, req.socket.localAddress)
                req.on('data', function (data) {
                    const payload = JSON.parse(data)
                    payload['ip'] = req.socket.localAddress
                    payload['timestamp'] = Date.now()
                    // request token
                    auth.Mongo.request(payload, (err, data) => {
                        if (err != null) {
                            sendResponse(401, JSON.stringify({ message: err }))
                            logger.http('Not generate token for %s, %s', req.socket.localAddress, err)
                        } else {
                            sendResponse(200, JSON.stringify({ status: 'Created', message: data }))
                            logger.http('Token generated for %s', req.socket.localAddress)
                        }
                    })
                })
            }
            else if (url == '/register') {
                logger.http('Incoming User %s request from %s', req.method, req.socket.localAddress)
                var payload, timestamp, hashUsername, hashPassword, temp
                auth.User.register_handler(req, res, (err, result) => {
                    if (err) { logger.error('There\'s an error, %s', err) }
                    else { logger.http(result) }
                })
            }
            else if (url == '/login') {
                auth.User.login_page(req, res, (err) => {
                    if (err) logger.error('There\'s an error, %s', err)
                })
            }
            // none of the uri above
            else {
                logger.http('Incoming %s request to %s from %s', req.method, url, req.socket.localAddress)
                sendResponse(404, JSON.stringify({ message: 'Not Found' }))
            }
        }

        // handler for GET method, mostly website handler
        const handlerGet = () => {
            if (req.headers['user-agent']) {
                if (url == '/') {
                    logger.http('Incoming User %s request home from %s', req.method, req.socket.localAddress)
                    auth.User.home_page(req, res, (err) => {
                        if (err) logger.error('There\'s an error, %s', err)
                    })
                    // } else if (url == '/login') {
                    //     logger.http('Incoming User %s request Login from %s', req.method, req.socket.localAddress)
                    //     auth.User.login_page(req, res, (err) => {
                    //         if (err) logger.error('There\'s an error, %s', err)
                    //     })
                } else if (url == '/register') {
                    logger.http('Incoming User %s request Register from %s', req.method, req.socket.localAddress)
                    auth.User.register_handler(req, res, (err, result) => {
                        if (err) { logger.error('There\'s an error, %s', err) }
                        else { logger.http(result) }
                    })
                }
                else {
                    logger.http('Incoming %s request to %s from %s', req.method, url, req.socket.localAddress)
                    auth.User.error(req, res)
                    //sendResponse(404, JSON.stringify({ message: 'Not Found' }))
                }
            } else {
                logger.http('Incoming %s request to %s from %s', req.method, url, req.socket.localAddress)
                sendResponse(406, JSON.stringify({ message: 'Not Acceptable' }))
            }
        }

        // handler for Other method
        const handlerOther = () => {
            logger.http('Incoming %s request from %s ', req.method, req.socket.localAddress)
            sendResponse(405, JSON.stringify({ message: 'Method Not Allowed' }))
        }

        // handling selection
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
