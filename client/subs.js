var mqtt = require('mqtt')
var options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiI5N3NqdWk1bW9kaCIsImRldmljZV9uYW1lIjoibm9kZW1jdSIsInRpbWVzdGFtcCI6MTU1NTM0MDcxMTM3Mywicm9sZSI6InB1Ymxpc2hlciIsImlhdCI6MTU1NTM0MDcxMSwiZXhwIjoxNTU1MzQwNzcxLCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.vYvtm4Mcg3KW-Itq2Hj_kQotZ82_q-VRa01t8K2AXyk',
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