var io = require('socket.io-client')
var socket = io.connect('http://127.0.0.1:' + 3000, {
    reconnect: true
});

socket.on('connect', () => {
    console.log(socket.id);
    socket.emit('subscribe', {
        topic: 'home'
    });
});

socket.on('/r/', (topic) => {
    console.log('home', topic)
})