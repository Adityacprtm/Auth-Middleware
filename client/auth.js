var request = require('request');
var jwt = require('jsonwebtoken')

var optionsDevice = {
    uri: 'http://127.0.0.1:8080/',
    method: 'POST',
    json: {
        "id": "1234",
        "secret": "secret1",
        "device": "nodemcu",
        "mac": "987"
    }
};

var optionsUser = {
    uri: 'http://127.0.0.1:8080/admin/login',
    method: 'PUT',
    json: {
        "username": "user",
        "password": "secret",
        "device": {
            "id": "5678",
            "secret": "secret2",
            "device": "arduino",
            "mac": "321"
        }
    }
}

request(optionsDevice, function (error, response, body) {
    if (error) console.log('ERROR: ' + error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
});

request(optionsUser, function (error, response, body) {
    if (error) console.log('ERROR: ' + error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
})