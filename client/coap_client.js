var coap, request, optionsCoAP, client, token, optionsDevice, topic = 'office', payload, req

coap = require('coap')
request = require('request')

var connect = function (token) {
    setInterval(function () {
        req = coap.request({
            host: '127.0.0.1',
            port: '5683',
            pathname: '/r/' + topic,
            //query: 'token=' + token,
            method: 'post'
        });

        payload = {
            protocol: 'coap',
            timestamp: new Date().getTime().toString(),
            topic: topic,
            token: token,
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
        req.write(JSON.stringify(payload));
        console.log('Message Sent ' + topic);

        req.on('response', function (res) {
            res.pipe(process.stdout)
            res.on('end', function () {
                process.exit(0)
            })
        })

        req.end()
    }, 10000)
}

var checkToken = function (callback) {
    if (token) {
        connect(token)
    } else {
        optionsDevice = {
            url: "http://127.0.0.1:8080/device/request",
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            json: true,
            body: {
                "device_id": "anojuth6j6z",
                "password": "juth6j70"
            }
        }
        request(optionsDevice, function (error, response, body) {
            if (error) callback(error, null)
            if (response.statusCode == 200 && body) {
                token = body
                console.log(token)
                connect(token)
            } else if (response.statusCode == 401) {
                data = body
                console.log(data)
                setTimeout(function () { console.log("Wait 10 seconds"); checkToken(); }, 10000)
            }
        });
    }
}

checkToken()