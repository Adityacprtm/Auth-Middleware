(function () {
    
    module.exports = (app) => {
        const logger = app.helpers.winston

        return (req, res) => {
            const sendResponse = (code, payload) => {
                res.code = code
                res.end(JSON.stringify(payload))
            }

            const handlerPost = () => {
                if (/^\/r\/(.+)$/.exec(req.url) === null) {
                    return sendResponse('4.05', {
                        message: 'No permission'
                    })
                }

                const topic = /^\/r\/(.+)$/.exec(req.url)[1]
                sendResponse('2.01', {
                    message: 'Created'
                })
                logger.coap('Incoming %s request from %s for topic %s ', req.method, req.rsinfo.address, topic)
            }

            switch (req.method) {
                case 'GET':
                case 'POST':
                    handlerPost()
                    break
                case 'PUT':
                default:
                    handlerPost()
                    break
            }
        }
    }
}).call(this)