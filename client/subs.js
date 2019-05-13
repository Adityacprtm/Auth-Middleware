let mqtt = require('mqtt')
let options = {
    port: 1883,
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VfaWQiOiIyYWtqdXRqNW53MyIsImRldmljZV9uYW1lIjoiYXJkdWlubyIsInRpbWVzdGFtcCI6IjE1NTYwMTQzMDkwNTkiLCJyb2xlIjoic3Vic2NyaWJlciIsImlhdCI6MTU1NjAxNDMwOSwiZXhwIjoxNTU2MDE0NDg5LCJpc3MiOiJhZGl0eWFjcHJ0bS5jb20ifQ.ebI9Klmg8uRATd-WEUt0GnETOtI56Y2oX4jh0KPQKR8',
    password: ''
}
let client = mqtt.connect('mqtt://127.0.0.1', options)
client.on('connect', function (packet) {
    let topic = "office"
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