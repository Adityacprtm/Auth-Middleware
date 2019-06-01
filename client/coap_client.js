let coap, request, key, crypto, token, topic, payload, req, id, pwd, valid = false, host

crypto = require('crypto')
coap = require('coap')
request = require('sync-request')
key = '17922ef895d7f9eed51705fa618902d7'
iv = 'ccc1730477fee41329a875286abce3f0'
id = '4a83e9a771004924495dd843aaeac76e145df42e2db7968aa660181cfda5229e'
pwd = '641e4670ff70255391ca779a385766edaafb1df0fbff5f3a28e0f19a9dc08e46'
client_id = 'coap_9d0af761'
host = '192.168.0.13'
topic = 'home'

let connect = function (token) {
    setInterval(function () {
        if (valid) {
            req = coap.request({
                host: host,
                port: '5683',
                //pathname: '/r/' + client_id + '/' + topic,
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
    var response = request('POST', 'http://' + host + '/device/request', {
        json: {
            "device_id": id,
            "device_password": pwd
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