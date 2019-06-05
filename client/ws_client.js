let socket, crypto, request, key, id, iv, pwd, token, topic, io, client_id, valid = false, host

crypto = require('crypto')
io = require('socket.io-client')
request = require('sync-request')
key = '1b743674584dd02e7cf0ad9678edb53b'
iv = '372a10454eafff52515fbbb7d3eb716f'
id = '9506a5ede78f1bf2c62d9f5405c186724f275870f7514ff8c049850f65adb066'
pwd = 'b9ced387009865af7b30c12de6f34bd0363cb5611fcb699115489ac2e7a274c5'
client_id = 'ws_74145d49'
host = '192.168.137.10'
topic = 'home'

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
            "device_password": pwd
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