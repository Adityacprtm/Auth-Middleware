let socket, crypto, request, key, id, iv, pwd, token, topic = 'office', io, client_id, valid = false

crypto = require('crypto')
io = require('socket.io-client')
request = require('sync-request')
key = '80aa33c70d02e965486aa32ef4b3911c'
iv = 'c3d117ad733ac0fa24660918c9aa4c1c'
id = '8d2b0107bd09bb49913969cfd4052f293104c7d7b25571da427588669cad04d9'
pwd = '436e6bac38abe9a41dce038f74822501ac71d6c8db91f92c89b1c753a9794a55'
client_id = 'ws_74145d49'

let connect = function (token) {
    if (valid) {
        socket = io.connect('http://127.0.0.1:' + 3000, {
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
    }
}

let getToken = function () {
    var response = request('POST', 'http://127.0.0.1/device/request', {
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