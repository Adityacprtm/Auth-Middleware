var coap = require('coap')

var topic = 'home'
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6MTU1NTM0MjA0NTgyNSwicm9sZSI6InB1Ymxpc2hlciIsImlhdCI6MTU1NTM0MjA0NSwiZXhwIjoxNTU1MzQyMTA1LCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.fLAEI5zsQOxXs7c6gEqDRPCP0wy6f6I_CccUJt3N5hg'

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
