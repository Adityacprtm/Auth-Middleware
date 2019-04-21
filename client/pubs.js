var mqtt = require('mqtt');

var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6IjE1NTU4NDQ5NzQxNDIiLCJyb2xlIjoicHVibGlzaGVyIiwiaWF0IjoxNTU1ODQ0OTc0LCJleHAiOjE1NTU4NDUxNTQsImlzcyI6ImFkaXR5YWNwcnRtLmNvbSJ9.Wds-KAOu3MfgVQ2NdWE88pQQOA4riM0mrnJLxk_aAUI',
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