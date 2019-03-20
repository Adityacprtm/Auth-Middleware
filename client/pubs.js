var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'alice',
    password: 'secret'
}
var client = mqtt.connect('mqtt://127.0.0.1', options);
client.on('connect', function () {
    console.log('Connected')
    setInterval(function () {
        var topic = 'home'
        var payload = {
            protocol: "mqtt",
            timestamp: new Date().getTime().toString(),
            topic: topic,
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
        client.publish(topic, JSON.stringify(payload), [1]);
        console.log('Message Sent');
    }, 10000);
});

client.on('close', (error) => {
    if (error) console.log(error.code)
    console.log('Server has refused connection')
});