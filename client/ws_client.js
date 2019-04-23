var coap, request, optionsCoAP, client, token, optionsDevice, topic = 'office', payload, req
var io = require('socket.io-client')
request = require('request')

var connect = function (token) {
    var topic = 'office'
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
                "device_id": "2akjutj5nw3",
                "password": "jutj5nw5"
            }
        }
        request(optionsDevice, function (error, response, body) {
            if (error) callback(error, null)
            if (response.statusCode == 200 && body) {
                token = body.message
                connect(token)
            } else if (response.statusCode == 401) {
                data = body.message
                console.log(data)
            }
        });
    }
}

checkToken()

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }