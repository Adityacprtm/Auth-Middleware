var coap = require('coap')

var topic = 'office'
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6IjE1NTU4NDQ5NzQxNDIiLCJyb2xlIjoicHVibGlzaGVyIiwiaWF0IjoxNTU1ODQ0OTc0LCJleHAiOjE1NTU4NDUxNTQsImlzcyI6ImFkaXR5YWNwcnRtLmNvbSJ9.Wds-KAOu3MfgVQ2NdWE88pQQOA4riM0mrnJLxk_aAUI'

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
