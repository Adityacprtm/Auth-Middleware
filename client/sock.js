var io = require('socket.io-client')

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6MTU1NTM0MzI3OTgxNywicm9sZSI6InB1Ymxpc2hlciIsImlhdCI6MTU1NTM0MzI3OSwiZXhwIjoxNTU1MzQzMzM5LCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.4TgonqeOFL7v8FJwTh9LWWxiG2KhVMP_qprEBcAYR1g'

var socket = io.connect('http://127.0.0.1:' + 3000, {
    reconnect: true,
    query: {
        token: token
    }
});

var topic = 'office'
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

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }