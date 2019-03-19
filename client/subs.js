var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'alice',
    password: 'secret'
}
var client = mqtt.connect('mqtt://127.0.0.1',options)
client.on('connect', function () {
    client.subscribe('home')
})
client.on('message', function (topic, message) {
    context = message.toString();
    json = JSON.stringify(context).replace(/\\/g, "")
    console.log(JSON.stringify(json))
})