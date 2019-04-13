module.exports = (app) => {
    const logger = app.helpers.winston
    const Data = require('../auth/models/Mongo')

    return (req, res) => {

        const url = req.url;

        // handle sending response
        const sendResponse = (code, payload) => {
            if (code == '401') {
                res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            }
            res.writeHead(code, { 'Content-Type': 'text/plain' })
            res.end(payload)
        }

        // handler for POST method
        const handlerPost = () => {
            // URI for device request
            if (url == '/request') {
                logger.http('Incoming Client %s request token from %s ', req.method, req.socket.localAddress)
                req.on('data', function (data) {
                    const payload = JSON.parse(data)
                    payload['ip'] = req.socket.localAddress
                    payload['timestamp'] = Date.now()
                    // request token
                    Data.request(payload, 'devices', (err, data) => {
                        if (err != null) {
                            sendResponse(400, JSON.stringify({ message: err }))
                            logger.http('Not generate token for %s, %s', req.socket.localAddress, err)
                        } else {
                            sendResponse(200, JSON.stringify({ status: 'Created', message: data }))
                            logger.http('Token generated for %s', req.socket.localAddress)
                        }
                    })
                    // logger.http('Server has refused, client %s identity rejected', req.socket.localAddress)
                });
                // URI for users regist their devices
            } else if (url == '/register') {
                logger.http('Incoming User %s request from %s', req.method, req.socket.localAddress)
                req.on('data', function (data) {
                    var payload, timestamp, hashUsername, hashPassword, temp
                    payload = JSON.parse(data)
                    timestamp = Date.now().toString()

                    logger.http('User %s added new device %s', payload.username, payload.device.device)
                })
            }
            // none of the uri above
            else {
                logger.http('Incoming %s request to %s from %s', req.method, url, req.socket.localAddress)
                sendResponse(404, JSON.stringify({ message: 'Not Found' }))
            }
        }

        // handler for GET method
        const handlerGet = () => {

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
