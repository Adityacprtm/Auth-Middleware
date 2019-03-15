var mqtt = require('mqtt');
var request = require('request');

var options = {
    port: 1883,
    username: 'alice',
    password: 'secret'
}

var client = mqtt.connect('mqtt://127.0.0.1', options);
client.on('connect', function () {
    setInterval(function () {
        client.publish('myTopic', 'Hello mqtt');
        console.log('Message Sent');
    }, 5000);
});