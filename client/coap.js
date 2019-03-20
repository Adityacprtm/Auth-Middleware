var coap = require('coap')

var topic = 'coap'
var payload = {
    protocol: 'coap',
    timestamp: new Date().getTime().toString(),
    topic: topic,
    sensor: {
        tipe: "4325",
        index: "string",
        ip: '127.0.0.1',
        module: "string"
    },
    humidity: {
        value: Math.floor(Math.random() * 100),
        unit: "string"
    },
    temperature: {
        value: Math.floor(Math.random() * 100),
        unit: "string"
    }
}

// the default CoAP port is 5683
var req = coap.request({
    host: '127.0.0.1',
    port: '5683',
    pathname: '/r/home',
    method: 'post'
});

req.on('response', function (res) {
    res.pipe(process.stdout)
    res.on('end', function () {
        process.exit(0)
    })
})

req.write(JSON.stringify(payload))

var getReq = coap.request({
    host: '127.0.0.1',
    port: '5683',
    pathname: '/r/office',
    method: 'get'
})

getReq.on('response', function (res) {
    res.pipe(process.stdout)
    res.on('end', function () {
        process.exit(0)
    })
})

getReq.end()
req.end()