let mqtt, request, crypto, client, token, clientID, key, iv, id, pwd, topic, payload, valid = false, host

crypto = require('crypto')
mqtt = require('mqtt')
request = require('sync-request')
clientID = 'mqttjs_74145d49'
key = "1e595ebbbe8cca1a3cbaeb6411d16fe4"
iv = "fa86d7acf043382456746dabcd8db57b"
id = "8d037303aa8ac4f5d3af37a1dcd3d217eca85de58180fc5591bac69a93629981"
pwd = "ade9bf56fe452eb68c599c989b414d31770683d8bc3fae88f191228ba2025f1c"
host = '192.168.0.13'
topic = 'home'

let connect = function (token) {
    if (valid) {
        client = mqtt.connect('mqtt://' + host, {
            port: 1883,
            username: token,
            password: '',
            clientId: clientID
        })

        client.on('connect', function () {
            console.log('Connected')
        })

        setInterval(function () {

            topic = topic
            payload = {
                protocol: client.options.protocol,
                timestamp: new Date().getTime().toString(),
                topic: topic,
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
            console.log(message.toString())
            client.end()
        })
    } else {
        token = getToken()
        connect(token)
    }
}

let getToken = function () {
    var response = request('POST', 'http://' + host + '/device/request', {
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
        console.log(data)
        console.log("Wait 10 seconds");
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