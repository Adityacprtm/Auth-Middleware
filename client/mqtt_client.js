var mqtt, optionsMqtt, optionsAuth, client, request
var username, password, url, auth, uuid, randomMac,
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY3OCwibmFtZSI6Im5vZGVtY3UiLCJtYWMiOiIwOTg3IiwiaXAiOiI6OmZmZmY6MTI3LjAuMC4xIiwidGltZXN0YW1wIjoxNTU1MTc3NDc5MDIyLCJpYXQiOjE1NTUxNzc0NzksImV4cCI6MTU1NTE3NzUzOX0.pSjQg9EcyyEOQV1EIGz2XYmnAlZVnxWAXLF7FU5erN0"

mqtt = require('mqtt')
request = require('request')
uuid = require('uuid')
randomMac = require('random-mac')
username = "176b4593c90d3f94876f42f1324e9dafaba31926"
password = "b56d730cace47884eb11ffa7603fe777"
url = "http://127.0.0.1:8080/"
auth = "Basic " + new Buffer.from((username + ":" + password).toString())

optionsAuth = {
    url: url,
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': auth
    },
    json: true,
    body: {
        "id": "a07ac9cb-4428-4690-9343-c2a433e6c009",
        "device": "nodemcu",
        "mac": "54:52:00:8b:99:e0"
    }
}

if (token == null) {
    request(optionsAuth, function (error, response, body) {
        if (error) console.log('ERROR: ' + error)
        if (response.statusCode == 200) {
            // token = body.token
            optionsMqtt = {
                port: 1883,
                username: token,
                pasword: '',
                keepalive: 10000
            }
            client = mqtt.connect('mqtt://127.0.0.1', optionsMqtt)
            client.on('connect', () => {
                console.log('Connected')
                setInterval(function () {
                    var topic = 'office'
                    var payload = {
                        protocol: client.options.protocol,
                        timestamp: new Date().getTime().toString(),
                        topic: topic,
                        sensor: {
                            tipe: "4325",
                            index: "string",
                            ip: client.options.host,
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
                    client.publish(topic, JSON.stringify(payload), [1]);
                    console.log('Message Sent ' + topic);
                }, 5000);
            })
        } else {
            console.log('statusCode:', response && response.statusCode)
            console.log('body:', body)
        }
    });
} else {
    optionsMqtt = {
        port: 1883,
        username: token,
        pasword: '',
        keepalive: 10000
    }
    client = mqtt.connect('mqtt://127.0.0.1', optionsMqtt)
    client.on('connect', () => {
        console.log('Connected')
        setInterval(function () {
            var topic = 'office'
            var payload = {
                protocol: client.options.protocol,
                timestamp: new Date().getTime().toString(),
                topic: topic,
                sensor: {
                    tipe: "4325",
                    index: "string",
                    ip: client.options.host,
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
            client.publish(topic, JSON.stringify(payload), [1]);
            console.log('Message Sent ' + topic);
        }, 5000);
    })
}

// client.on('close', (error) => {
//     if (error) console.log(error)
// });

// client.on('error', (error) => {
//     if (error) console.log(error.toString())
//     client.end(true)
// })