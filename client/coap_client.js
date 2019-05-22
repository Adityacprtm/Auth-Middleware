let coap, request, key, crypto, token, topic = 'home', payload, req, id, pwd, valid = false

crypto = require('crypto')
coap = require('coap')
request = require('sync-request')
key = '0b8eedf201714c9a0c6b8f0676a1d705'
iv = '4d39447d472fa4281ec821755b55a3b7'
id = 'f8f725530e7642660746cd8de70a9b4859b55fc33d2e76d14e8d5ad7ce9b3b67'
pwd = 'a5dd08be9d78c0777282e9c9a21d6d783a2353a2898b02d67a4d87f32c72f48d'
client_id = 'coap_9d0af761'

let connect = function (token) {
    setInterval(function () {
        if (valid) {
            req = coap.request({
                host: '192.168.0.21',
                port: '5683',
                pathname: '/r/' + client_id + '/' + topic,
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
                } else if (res.code == "4.00") {
                    console.log(res.payload.toString())
                    token = getToken()
                }
            })
            req.end()
        } else {
            token = getToken()
        }
    }, 5000)
}

let getToken = function () {
    var response = request('POST', 'http://192.168.0.21/device/request', {
        json: {
            "device_id": id,
            "password": pwd
        },
    });
    if (response.statusCode == 200 && response.body) {
        token = decrypt(response.body.toString())
        console.log("Got Token");
        valid = true
        return token
    } else if (response.statusCode == 401) {
        data = response.body.toString()
        console.log(data + ' - Wait 10 seconds')
        setTimeout(function () { getToken(); }, 10000)
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

if (require.main === module) {
    connect(token)
}