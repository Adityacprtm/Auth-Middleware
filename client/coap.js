let coap = require('coap')


let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiIyYWtqdXRqNW53MyIsImRldmljZV9uYW1lIjoiYXJkdWlubyIsInRpbWVzdGFtcCI6IjE1NTYwMTQ1MDU3NDEiLCJyb2xlIjoic3Vic2NyaWJlciIsImlhdCI6MTU1NjAxNDUwNSwiZXhwIjoxNTU2MDE0Njg1LCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.MeY_F_QoaRPrPNdXW5SNJRFl9l8K2_yJiijI-t3IT1E'
let topic = 'office'
let payload = {
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

let req = coap.request({
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

// let getReq = coap.request({
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
