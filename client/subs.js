var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQiLCJkZXZpY2UiOiJub2RlbWN1IiwidGltZXN0YW1wIjoxNTUzNDg1NTM3LCJpcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJtYWMiOiI5ODciLCJzZWNyZXQiOiJzZWNyZXQiLCJpYXQiOjE1NTM0ODU1MzcsImV4cCI6MTU1MzQ5NjMzN30.GKQGhnuuI0tBNknbOXuZ2Ypt2iM54kEa0XW35tnrPc4',
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
    client.stream.end()
})

client.on('disconnect', (reason) => {
    console.log(reason);
    client.stream.end()
})