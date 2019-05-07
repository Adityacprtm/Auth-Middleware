var mqtt, request, optionsMQTT, client, token, optionsDevice

const crypto = require('crypto')
mqtt = require('mqtt')
request = require('request')
key = "56dbde64c5c46455b0452f1843509138"
ivs = "06479be67fd222d45254454f6e528892"
clientID = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

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
                "device_id": "7eadb3ae62640504e1b4f7957d91cf6a43395f1d959a5738adc439902ca69503",
                "password": "061ed09f094f7a2e5d43b037ec9a908d61d2ff0f424652aa6243b757a5c3d1ab"
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
    let iv = Buffer.from(ivs, 'hex');
    let encryptedText = Buffer.from(cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

checkToken()