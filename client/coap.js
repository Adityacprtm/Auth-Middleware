var coap = require('coap')

var topic = 'home'
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJhendqdWpoNjJpaCIsImRldmljZV9uYW1lIjoiYXJkdWlubyIsInRpbWVzdGFtcCI6MTU1NTQwMjcxNDgzMSwicm9sZSI6InN1YnNjcmliZXIiLCJpYXQiOjE1NTU0MDI3MTQsImV4cCI6MTU1NTQwNjMxNCwiaXNzIjoiYWRpdHlhY3BydG0uY29tIn0.7RNUKrvZcY-RR5_HZ53b13MfCiSO9WwehnzRskwJ0gw'

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

var req = coap.request({
    host: '127.0.0.1',
    port: '5683',
    pathname: '/r/' + topic,
    query: 'token=' + token,
    method: 'post'
});
req.on('response', function (res) {
    res.pipe(process.stdout)
    res.on('end', function () {
        process.exit(0)
    })
})
req.write(JSON.stringify(payload))
req.end()

// var getReq = coap.request({
//     host: '127.0.0.1',
//     port: '5683',
//     pathname: '/r/' + topic,
//     query: 'token=' + token,
//     method: 'get'
// })
// getReq.on('response', function (res) {
//     res.pipe(process.stdout)
//     res.on('end', function () {
//         process.exit(0)
//     })
// })
// getReq.end()
