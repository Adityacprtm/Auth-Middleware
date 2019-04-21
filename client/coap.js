var coap = require('coap')

var topic = 'office'
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI2cXNqdXI0eG1wNiIsImRldmljZV9uYW1lIjoicmFzcGJlcnJ5IHBpIiwidGltZXN0YW1wIjoiMTU1NTg2NDAwMjk1OCIsInJvbGUiOiJwdWJsaXNoZXIiLCJpYXQiOjE1NTU4NjQwMDIsImV4cCI6MTU1NTg2NDE4MiwiaXNzIjoiYWRpdHlhY3BydG0uY29tIn0.CJhgrWWQ9tOE8smbwyXcYNei_kHamQu3OMeHdDc4oKo'

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
