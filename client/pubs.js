var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'alice',
    password: 'secret'
}
var payload = {
    protocol: "mqtt",
    timestamp: "ger",
    topic: "string",
    sensor: {
        tipe: "4325",
        index: "string",
        ip: "string",
        module: "string"
    },
    humidity: {
        value: "64554",
        unit: "string"
    },
    temperature: {
        value: "12",
        unit: "string"
    }
}


var client = mqtt.connect('mqtt://127.0.0.1', options);
client.on('connect', function () {
    setInterval(function () {
        client.publish('home', JSON.stringify(payload));
        console.log('Message Sent');
    }, 5000);
});