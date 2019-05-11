var coap, request, key, crypto, token, optionsDevice, topic = 'home', payload, req, id, pwd

crypto = require('crypto')
coap = require('coap')
request = require('request')
key = '048d6b03d40e243dae2f2437900f311a'
id = "e4838d7e3ee627002cf97ab7de3066857d4509d33fe101afdafb5fda29f3577e"
pwd = "8c558fef290d83bb7e70a8c011ecebeee14e1293b25dfae9d63250e3141897c3"
client_id = Math.random().toString(16).substr(2, 8)

var connect = function (token) {
    setInterval(function () {
        req = coap.request({
            host: '127.0.0.1',
            port: '5683',
            pathname: '/r/' + client_id + '/' + topic,
            //query: 'token=' + token,
            method: 'post',
            confirmable: false
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
                "device_id": id,
                "password": pwd
            }
        }
        request(optionsDevice, function (error, response, body) {
            if (error) callback(error, null)
            if (response.statusCode == 200 && body) {
                token = decrypt(body)
                connect(token)
            } else if (response.statusCode == 401) {
                data = body
                console.log(data)
                setTimeout(function () { console.log("Wait 10 seconds"); checkToken(); }, 10000)
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