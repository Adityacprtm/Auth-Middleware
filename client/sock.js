var io = require('socket.io-client')
var socket = io.connect('http://127.0.0.1:' + 3000, {
    reconnect: true
});

var topic = 'office'
socket.on('connect', () => {
    socket.emit('subscribe', topic);
});

socket.on('/r/'+topic, (data) => {
    console.log(data)
})

socket.on('error', (error) => {
    console.log(error)
});

socket.on('connect_error', (error) => {
    console.log(error)
});

socket.on('disconnect', (error) => {
    console.log(error)
})

// WebSocket = require('ws')
// ws = new WebSocket('http://127.0.0.1:3000'), {
//     headers: {
//         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaW9zdHJlYW1lciJ9.oNx-4e9hldyATpdPZghd_sjX8DhTkQFVDBxIhKh4MC4"
//     }
// }