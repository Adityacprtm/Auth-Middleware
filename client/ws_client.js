var request, key, id, pwd, token, optionsDevice, topic = '9d0af761/home'
var io = require('socket.io-client')
const crypto = require('crypto')
request = require('request')
key = "80aa33c70d02e965486aa32ef4b3911c"
iv = "c3d117ad733ac0fa24660918c9aa4c1c"
id = "8d2b0107bd09bb49913969cfd4052f293104c7d7b25571da427588669cad04d9"
pwd = "436e6bac38abe9a41dce038f74822501ac71d6c8db91f92c89b1c753a9794a55"

var connect = function (token) {
    var socket = io.connect('http://127.0.0.1:' + 3000, {
        reconnect: true,
        query: {
            token: token
        }
    });

    socket.on('connect', () => {
        socket.emit('subscribe', topic);
    });

    socket.on('/r/' + topic, (data) => {
        console.log(data)
    })

    socket.on('error', (error) => {
        console.log(error)
    });

    socket.on('disconnect', (error) => {
        console.log(error)
    })

    socket.on('error_msg', (reason) => {
        console.log(reason);
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
                console.log("Got Token");
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

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }