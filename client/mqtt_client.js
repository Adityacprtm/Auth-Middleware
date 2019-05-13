let optionsMQTT, client, token, optionsDevice

const crypto = require('crypto')
let mqtt = require('mqtt')
let request = require('request')
let key = "c15f2d07f8c3949a822f05dab4837d07"
let iv = "78b3e8e9a5428b9c197a7826e5d9ce83"
let id = "a334859eeb658b83f6233ff77a88627bfdfe03bd3b26652b7c36f8005c1f97c3"
let pwd = "fe24a834f5a1b27361b584514e6de87b2edd4cb419b62c9f4965205bba604de5"
let clientID = 'mqttjs_74145d49'

let connect = function (token) {
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
        let topic = clientID + '/office'
        let payload = {
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

let checkToken = function () {
    if (token) {
        connect(token)
    } else {
        optionsDevice = {
            url: "http://127.0.0.1/device/request",
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

let decrypt = function (cipher) {
    let encryptedText = Buffer.from(cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

let encrypt = function (plain) {
    let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(plain);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex')
}
checkToken()