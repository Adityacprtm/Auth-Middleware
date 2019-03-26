var io = require('socket.io-client')

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJkZXZpY2UiOiJub2RlbWN1IiwidGltZXN0YW1wIjoxNTUzNTEwNzkxLCJpcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJtYWMiOiI5ODciLCJzZWNyZXQiOiJzZWNyZXQiLCJpYXQiOjE1NTM1MTA3OTEsImV4cCI6MTU1MzUyMTU5MX0.Q4BPplWlWVAt5eNwOiMoc1HZrxRcftqCrHggTAX1J4E'

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