let socket, crypto, request, key, id, iv, pwd, token, topic, io, client_id, valid = false, host

crypto = require('crypto')
io = require('socket.io-client')
request = require('sync-request')
key = '0580b85cff97f393378e97707158cb4f'
iv = '4173bcbf7992b024fa9f3fac2847aba7'
id = 'b71ec17d9d9d2cd542282f1fd6f97d9e8c1e075644f16057942b126f8eeef9a5'
pwd = '8d67a6d0b397c212cb7f3a758c80b10d5d7c7e6087471e05e8d4c9b885b78ed8'
client_id = 'ws_74145d49'
host = '192.168.43.10'
topic = '5665920/home'

let connect = function (token) {
    //    setInterval(function () {
    if (valid) {
        socket = io.connect('http://' + host + ':' + 3000, {
            reconnect: true,
            query: {
                token: token
            }
        });

        socket.on('connect', () => {
            socket.emit('subscribe', topic);
        });

        socket.on('/r/' + topic, (data) => {
            console.log(data)
        })

        socket.on('error', (error) => {
            console.log(error)
        });

        socket.on('disconnect', (error) => {
            console.log(error)
        })

        socket.on('error_msg', (reason) => {
            console.log(reason);
        })
    } else {
        token = getToken()
        connect(token)
    }
    //    }, 5000)
}

let getToken = function () {
    var response = request('POST', 'http://' + host + '/device/request', {
        json: {
            "device_id": id,
            "password": pwd
        },
    });
    if (response.statusCode == 200 && response.body) {
        token = decrypt(response.body.toString())
        console.log("Got Token");
        valid = true
        return token
    } else if (response.statusCode == 401) {
        data = response.body.toString()
        console.log(data + ' - Wait 10 seconds')
        setTimeout(function () { getToken(); }, 10000)
    }
}

let decrypt = function (cipher) {
    let encryptedText = Buffer.from(cipher, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

let encrypt = function (plain) {
    let cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(plain);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex')
}

if (require.main === module) {
    connect(token)
}