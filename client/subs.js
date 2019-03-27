var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJzZWNyZXQiOiJzZWNyZXQxIiwiZGV2aWNlIjoibm9kZW1jdSIsIm1hYyI6Ijc4OSIsImlhdCI6MTU1MzYxNzcyNywiZXhwIjoxNTUzNjI4NTI3fQ.rCvBfvCPBQ7heyYwFa9j1rtzUwjuB080fk3btIIRSQk',
    password: ''
}
var client = mqtt.connect('mqtt://127.0.0.1', options)
client.on('connect', function (packet) {
    var topic = "office"
    console.log('connected')
    client.subscribe(topic, {
        qos: 1
    })
    console.log('subscribed')
})

client.on('message', function (topic, message) {
    context = message.toString();
    json = JSON.stringify(context).replace(/\\/g, "")
    console.log(json)
})

client.on('close', (error) => {
    if (error) console.log(error)
    console.log('Server has refused connection')
});

client.on('error', (error) => {
    if (error) console.log(error.toString())
    client.end(true)
})

client.on('disconnect', (reason) => {
    console.log(reason);
    client.end(true)
})