var coap = require('coap')

var topic = 'home'
var token = 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY3OCwibmFtZSI6Im5vZGVtY3UiLCJtYWMiOiIwOTg3IiwiaXAiOiI6OmZmZmY6MTI3LjAuMC4xIiwidGltZXN0YW1wIjoxNTU1MTc2OTkzOTcwLCJpYXQiOjE1NTUxNzY5OTQsImV4cCI6MTU1NTE3NzA1NH0.f9YAebkV_-JxeNJqU1Bxpx6KXEtuMIzXeRPVpWBrLWY'

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
        value: Math.floor(Date.now() / 1000),
        unit: "string"
    },
    temperature: {
        value: Math.floor(Date.now() / 1000),
        unit: "string"
    }
}

// the default CoAP port is 5683
var req = coap.request({
    host: '127.0.0.1',
    port: '5683',
    pathname: '/r/' + topic,
    query: token,
    method: 'post'
});

req.on('response', function (res) {
    res.pipe(process.stdout)
    res.on('end', function () {
        process.exit(0)
    })
})

req.write(JSON.stringify(payload))

// var getReq = coap.request({
//     host: '127.0.0.1',
//     port: '5683',
//     pathname: '/r/' + topic,
//     query: token,
//     method: 'get'
// })

// getReq.on('response', function (res) {
//     res.pipe(process.stdout)
//     res.on('end', function () {
//         process.exit(0)
//     })
// })

// getReq.end()
req.end()