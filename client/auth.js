var request = require('request'),
    username = "1234",
    password = "secret_key",
    url = "http://127.0.0.1:8080/",
    auth = "Basic " + new Buffer(username + ":" + password).toString()
    //auth = "Basic " + username + ":" + password;

var optionsDevice = {
    url: url,
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': auth
    },
    json: true,
    body: {
        "id": "1234",
        "device": "nodemcu",
        "mac": "789"
    }
};

// var optionsUser = {
//     uri: 'http://127.0.0.1:8080/admin/login',
//     method: 'PUT',
//     json: {
//         "username": "user",
//         "password": "secret",
//         "device": {
//             "id": "5678",
//             "secret": "secret2",
//             "device": "arduino",
//             "mac": "321"
//         }
//     }
// }

request(optionsDevice, function (error, response, body) {
    if (error) console.log('ERROR: ' + error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
});

// request(optionsUser, function (error, response, body) {
//     if (error) console.log('ERROR: ' + error);
//     console.log('statusCode:', response && response.statusCode);
//     console.log('body:', body);
// })