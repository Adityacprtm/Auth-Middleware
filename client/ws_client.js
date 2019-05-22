let socket, crypto, request, key, id, iv, pwd, token, topic = 'coap_9d0af761/home', io, client_id, valid = false

crypto = require('crypto')
io = require('socket.io-client')
request = require('sync-request')
key = '75d53688f7914780e6ee07a03df0d9f4'
iv = 'b7aac508bbfcb319b0337c84ee8d70ce'
id = '2f437b0fadd4a43c2bd9cd4bb98e32e699ef142cf06406b1d8cc85058a485ee5'
pwd = 'd3ece217a1cd2eae549a55ca92f904a3a80ef678722ee968fa6411a3534d8659'
client_id = 'ws_74145d49'

let connect = function (token) {
//    setInterval(function () {
        if (valid) {
            socket = io.connect('http://192.168.0.21:' + 3000, {
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
    var response = request('POST', 'http://192.168.0.21/device/request', {
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