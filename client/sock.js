var io = require('socket.io-client')

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY3OCwibmFtZSI6Im5vZGVtY3UiLCJtYWMiOiIwOTg3IiwiaXAiOiI6OmZmZmY6MTI3LjAuMC4xIiwidGltZXN0YW1wIjoxNTU1MTc3NDc5MDIyLCJpYXQiOjE1NTUxNzc0NzksImV4cCI6MTU1NTE3NzUzOX0.pSjQg9EcyyEOQV1EIGz2XYmnAlZVnxWAXLF7FU5erN0'

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

socket.on('jwtMsg', (reason) => {
    console.log(reason);
})

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }