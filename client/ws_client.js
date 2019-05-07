var coap, request, optionsCoAP, client, token, optionsDevice, topic = 'office', payload, req
var io = require('socket.io-client')
const crypto = require('crypto')
request = require('request')
key = "959f4b557941e7601e33e4d8ba47aa38"
ivs = "92076048750d88caa3565fb45ee25c3d"

var connect = function (token) {
    console.log(token)
    var topic = 'mqttjs_d3730daf/office'
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
                "device_id": "d617e4097f6442f062ae2fa1841054c5d79f2f2196f74b3f69477f5a321db32d",
                "password": "aa6341994dbe1692227ea1d743a4bc61b13310398dbd276e6839bbfe43d4ec7e"
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
    let iv = Buffer.from(ivs, 'hex');
    let encryptedText = Buffer.from(cipher, 'hex');
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