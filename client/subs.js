var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'alice',
    password: 'secret'
}
var client = mqtt.connect('mqtt://127.0.0.1', options)
client.on('connect', function () {
    var topic = "home"
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
    if (error) console.log(error.code)
    console.log('Server has refused connection')
});