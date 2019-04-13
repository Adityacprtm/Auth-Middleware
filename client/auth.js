var uuid = require('uuid')
var randomMac = require('random-mac')

var request = require('request'),
    username = "user",
    password = "secret_key",
    //username = "6aba8c90a10f23edf3f82c7a0c77e9bc9125eb66",
    //password = "c11db09efa0603a4803e903682af40ae",
    url = "http://127.0.0.1:8080/",
    auth = "Basic " + new Buffer.from(username + ":" + password).toString('base64')

var optionsDevice = {
    url: url + "request",
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': auth
    },
    json: true,
    body: {
        "id": 5678,
        "name": "nodemcu",
        "mac": "0987",
    }
};

var optionsUser = {
    uri: url + "admin/login",
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': auth
    },
    json: true,
    body: {
        "username": "admin",
        "device": {
            "id": uuid(),
            "device": "nodemcu",
            "mac": randomMac()
        }
    }
}

var validDevice = {
    url: url + "valid",
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': auth
    },
    json: true,
    body: {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjU2NzgsIm5hbWUiOiJub2RlbWN1IiwibWFjIjoiMDk4NyIsImlwIjoiOjpmZmZmOjEyNy4wLjAuMSIsInRpbWVzdGFtcCI6MTU1NTA2MDg0OTI4OCwiaWF0IjoxNTU1MDYwODQ5LCJleHAiOjE1NTUwNjA5MDl9.1SbWqtcmzM-tWmWQNy-5r9W6Pv4jf-NFX9S5F-vXQhk"
    }
}

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

// request(validDevice, function (error, response, body) {
//     if (error) console.log('ERROR: ' + error);
//     console.log('statusCode:', response && response.statusCode);
//     console.log('body:', body);
// });