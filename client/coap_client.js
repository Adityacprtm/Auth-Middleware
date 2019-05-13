var coap, request, key, crypto, token, optionsDevice, topic = '9d0af761/home', payload, req, id, pwd

crypto = require('crypto')
coap = require('coap')
request = require('request')
key = 'bf3a6cd87447a449e8773ed0f379e7ed'
iv = 'aeea2de30c794f7951aa86e0bd33b46d'
id = "9233dd8d00bd5665843710fe38c11d9feae7ad257f0c4d3e47ae77232700ce23"
pwd = "e503caf81207173100ffca6107a56ca6dfe332246cd5cff25d78b0110793e3cd"
client_id = Math.random().toString(16).substr(2, 8)

var connect = function (token) {
    setInterval(function () {
        req = coap.request({
            host: '127.0.0.1',
            port: '5683',
            pathname: '/r/' + topic,
            //query: 'token=' + token,
            method: 'post',
            confirmable: true
        });

        payload = {
            protocol: 'coap',
            timestamp: new Date().getTime().toString(),
            topic: topic,
            token: token,
            humidity: {
                value: Math.floor(Date.now() / 1000),
                unit: "string"
            },
            temperature: {
                value: Math.floor(Date.now() / 1000),
                unit: "string"
            }
        }
        req.write((JSON.stringify(payload)));

        req.on('response', function (res) {
            console.log(res.code)
            if (res.code == "2.01") {
                console.log('Message Sent ' + topic);
            } else if (res.code == "5.00") {
                checkToken()
            }
        })

        req.end()

    }, 5000)
}

var checkToken = function () {
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
        console.log(Date.now())
        if (error) console.log(error, null)
        if (response.statusCode == 200 && body) {
            token = decrypt(body)
            console.log("Got Token");
            console.log(Date.now())
            connect(token)
        } else if (response.statusCode == 401) {
            data = body
            console.log(data)
            console.log("Wait 10 seconds");
            setTimeout(function () { checkToken(); }, 10000)
        }
    });
}

var decrypt = function (cipher) {
    let encryptedText = Buffer.from(cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

var encrypt = function (plain) {
    var cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    var encrypted = cipher.update(plain);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex')
}

checkToken()