var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://127.0.0.1')
client.on('connect', function () {
    client.subscribe('home')
})
client.on('message', function (topic, message) {
    context = message.toString();
    json = JSON.stringify(context).replace(/\\/g, "")
    console.log(JSON.stringify(json))
})