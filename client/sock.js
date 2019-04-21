var io = require('socket.io-client')

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJhendqdWpoNjJpaCIsImRldmljZV9uYW1lIjoiYXJkdWlubyIsInRpbWVzdGFtcCI6IjE1NTU4NDQ4NzM1NDEiLCJyb2xlIjoic3Vic2NyaWJlciIsImlhdCI6MTU1NTg0NDg3MywiZXhwIjoxNTU1ODQ1MDUzLCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.OTW2U06WsQJD2jWZ0WTk7YYxEc1MrgYF3B2Pxa-C8tU'

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