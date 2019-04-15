var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6MTU1NTM0MDcxMTM3Mywicm9sZSI6InB1Ymxpc2hlciIsImlhdCI6MTU1NTM0MDcxMSwiZXhwIjoxNTU1MzQwNzcxLCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.vYvtm4Mcg3KW-Itq2Hj_kQotZ82_q-VRa01t8K2AXyk',
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
    if (error) console.log(error.toString())
});

client.on('error', (error) => {
    if (error) console.log(error.toString())
    client.end(true)
})