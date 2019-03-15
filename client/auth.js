var request = require('request');

var options = {
    uri: 'http://127.0.0.1:8080',
    method: 'POST',
    json: {
        'id': '123',
        'device': 'nodemcu1',
        'timestamp': '14/03/2019',
        'ip': '192.168.40.56',
        'mac': 'sdf8asf912EY',
        'secret': 'secret_key'
    }
};

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the shortened url.
    }
});