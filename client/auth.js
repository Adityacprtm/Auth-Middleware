var request = require('request');
var jwt = require('jsonwebtoken')

var options = {
    uri: 'http://127.0.0.1:8080/',
    method: 'POST',
    json: {
        'id': '123',
        'device': 'device1',
        'timestamp': new Date().getTime().toString(),
        'ip': '192.168.40.56',
        'mac': 'qwerty12345',
        'secret': 'P6EMy4OcpnPB94F5y7YmVJcc2aO6O68A'
    }
};

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the shortened url.
        jwt.verify(body.token, 'P6EMy4OcpnPB94F5y7YmVJcc2aO6O68A', (err, decode) => {
            if (err) console.log(err)
            console.log(decode)
        })
    } else {
        console.log('anything')
    }
});