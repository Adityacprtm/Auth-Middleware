var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJzZWNyZXQiOiJzZWNyZXQxIiwiZGV2aWNlIjoibm9kZW1jdSIsIm1hYyI6Ijc4OSIsImlhdCI6MTU1MzYxNzcyNywiZXhwIjoxNTUzNjI4NTI3fQ.rCvBfvCPBQ7heyYwFa9j1rtzUwjuB080fk3btIIRSQk',
    password: ''
}
var client = mqtt.connect('mqtt://127.0.0.1', options);
client.on('connect', function () {
    console.log('Connected')
    setInterval(function () {
        var topic = 'office'
        var payload = {
            protocol: client.options.protocol,
            timestamp: new Date().getTime().toString(),
            topic: topic,
            sensor: {
                tipe: "4325",
                index: "string",
                ip: client.options.host,
                module: "string"
            },
            humidity: {
                value: Math.floor(Math.random() * 100),
                unit: "string"
            },
            temperature: {
                value: Math.floor(Math.random() * 100),
                unit: "string"
            }
        }
        client.publish(topic, JSON.stringify(payload), [1]);
        console.log('Message Sent ' + topic);
    }, 2000);
});

client.on('close', (error) => {
    if (error) console.log(error)
});

client.on('error', (error) => {
    if (error) console.log(error.toString())
    client.end(true)
})