var coap = require('coap')

var topic = 'home'
var token = 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJkZXZpY2UiOiJub2RlbWN1IiwidGltZXN0YW1wIjoxNTUzNTEwNzkxLCJpcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJtYWMiOiI5ODciLCJzZWNyZXQiOiJzZWNyZXQiLCJpYXQiOjE1NTM1MTA3OTEsImV4cCI6MTU1MzUyMTU5MX0.Q4BPplWlWVAt5eNwOiMoc1HZrxRcftqCrHggTAX1J4E'

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