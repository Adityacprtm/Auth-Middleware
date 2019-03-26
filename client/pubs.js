var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJkZXZpY2UiOiJub2RlbWN1IiwidGltZXN0YW1wIjoxNTUzNTEwNzkxLCJpcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJtYWMiOiI5ODciLCJzZWNyZXQiOiJzZWNyZXQiLCJpYXQiOjE1NTM1MTA3OTEsImV4cCI6MTU1MzUyMTU5MX0.Q4BPplWlWVAt5eNwOiMoc1HZrxRcftqCrHggTAX1J4E',
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