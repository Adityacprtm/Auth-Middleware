var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiJhendqdWpoNjJpaCIsImRldmljZV9uYW1lIjoiYXJkdWlubyIsInRpbWVzdGFtcCI6MTU1NTQwMjcxNDgzMSwicm9sZSI6InN1YnNjcmliZXIiLCJpYXQiOjE1NTU0MDI3MTQsImV4cCI6MTU1NTQwNjMxNCwiaXNzIjoiYWRpdHlhY3BydG0uY29tIn0.7RNUKrvZcY-RR5_HZ53b13MfCiSO9WwehnzRskwJ0gw',
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
    client.end(true)
});

client.on('error', (error) => {
    if (error) console.log(error.toString())
    client.end(true)
})

client.on('disconnect', (reason) => {
    console.log(reason);
    client.end(true)
})