var mqtt, request, optionsMQTT, client, token, optionsDevice

mqtt = require('mqtt')
request = require('request')

var connect = function (token) {
    optionsMQTT = {
        port: 1883,
        username: token,
        password: ''
    }
    client = mqtt.connect('mqtt://127.0.0.1', optionsMQTT)
    client.on('connect', function () {
        console.log('Connected')
    })

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
        client.publish(topic, JSON.stringify(payload), { qos: 1 });
        console.log('Message Sent ' + topic);
    }, 5000);

    client.on('close', (error) => {
        if (error) console.log(error.toString())
        client.end(true)
    });

    client.on('error', (error) => {
        if (error) console.log(error.toString())
        client.end(true)
    })

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
        client.end()
    })
}

var checkToken = function () {
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
            if (error) console.log(error, null)
            if (response.statusCode == 200 && body) {
                token = body
                connect(token)
            } else if (response.statusCode == 401) {
                data = body
                console.log(data)
                console.log("Wait 10 seconds");
                setTimeout(function () { checkToken(); }, 10000)
            }
        });
    }
}

checkToken()