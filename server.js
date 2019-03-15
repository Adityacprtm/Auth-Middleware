(function () {
    let start, configure, app, logger, coap, consign, auth, argv;
    let coapServer, mqttServer, authServer;

    coap = require('coap')
    mqtt = require('mqtt')
    auth = require('http')
    module.exports.app = app = require('http').createServer()
    io = require('socket.io')(app)
    consign = require('consign')

    module.exports.configure = configure = () => {
        return consign({
                cwd: 'lib',
                verbose: false
            })
            .include('helpers')
            .include('controllers')
            .into(app)
    }

    module.exports.start = start = (opts, cb) => {
        configure()

        logger = app.helpers.winston
        argv = app.helpers.yargs

        if (opts == null) {
            opts = {}
        }
        if (cb == null) {
            cb = () => {}
        }

        opts.port || (opts.port = argv['port'])
        opts.coap || (opts.coap = argv['coap'])
        opts.mqtt || (opts.mqtt = argv['mqtt'])
        opts.auth || (opts.auth = argv['auth'])
        opts.mqttHost || (opts.mqttHost = argv['mqtt-host'])
        opts.redisPort || (opts.redisPort = argv['redis-port'])
        opts.redisHost || (opts.redisHost = argv['redis-host'])
        opts.redisDB || (opts.redisDB = argv['redis-db'])

        // CoAP Gateway
        coapServer = coap.createServer()
        coapServer.on('request', app.controllers.coap_api).listen(opts.coap, () => {
            logger.coap('CoAP server listening on port %d in %s mode', opts.coap, process.env.NODE_ENV)
        });

        // MQTT Gateway
        mqttServer = mqtt.Server(app.controllers.mqtt_api).listen(opts.mqtt, () => {
            logger.mqtt('MQTT server listening on port %d in %s mode', opts.mqtt, process.env.NODE_ENV)
        });

        // Websocket Gateway
        app.listen(opts.port, () => {
            logger.socket('Websocket listening on port %d in %s mode', opts.port, process.env.NODE_ENV)
        });

        // Auth Gateway
        authServer = auth.createServer(app.controllers.auth_api).listen(opts.auth, () => {
            logger.http('HTTP server listening on port %d in %s mode', opts.auth, process.env.NODE_ENV)
        });

        return app
    }

    if (require.main.filename === __filename) {
        start()
    }

}).call(this)