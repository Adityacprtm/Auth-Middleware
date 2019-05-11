var optionsMQTT, client, token, optionsDevice

const crypto = require('crypto')
var mqtt = require('mqtt')
var request = require('request')
var key = "51e5b379584d3faa99f8d8046dfadc28"
var id = "5fe64b3576f8f17dd614c798fd0a992318d6721e0fd8c3e4f2de79e0abf02af7"
var pwd = "57b6592674b2bb5697b06026baa8fef87e20a6adcbf4d60e4ea8074c79b22a0c"
var clientID = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

var connect = function (token) {
    optionsMQTT = {
        port: 1883,
        username: token,
        password: '',
        clientId: clientID
    }
    client = mqtt.connect('mqtt://127.0.0.1', optionsMQTT)
    client.on('connect', function () {
        console.log('Connected')
    })

    setInterval(function () {
        var topic = clientID + '/office'
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
                "device_id": id,
                "password": pwd
            }
        }
        request(optionsDevice, function (error, response, body) {
            if (error) console.log(error, null)
            if (response.statusCode == 200 && body) {
                token = decrypt(body)
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

var decrypt = function (cipher) {
    let iv = Buffer.from(cipher.iv, 'hex');
    let encryptedText = Buffer.from(cipher.cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

checkToken()