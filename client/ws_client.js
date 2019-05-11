var request, key, id, pwd, token, optionsDevice, topic = '5669243/home'
var io = require('socket.io-client')
const crypto = require('crypto')
request = require('request')
key = "095229fdf251543df2db17f98ae3c8d4"
id = "72ee9e48d7f7405fa06f37667fe6de7f2de86342f89537943bc28e331ddbb1ea"
pwd = "5fa9247e1c13d7507a429cdcecfad12e8e1a3720f0cecd3181a742ca4edf0539"

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

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }