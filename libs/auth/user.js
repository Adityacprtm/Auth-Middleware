var ejs = require('ejs')
var data_mongo = require('./models/Mongo')
var { parse } = require('querystring');

function collect_request_data(req, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (req.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

function user_checker(req, res, callback) {
    collect_request_data(req, result => {
        var data_user = {
            username: result.username,
            password: result.password
        }
        var data_device = {
            device_name: result.device_name,
            description: result.description,
            role: result.role,
            user: result.username
        }
        data_mongo.check_user(data_user, (err, reply) => {
            if (err) {
                callback(err, null)
            } else {
                if (reply == true) {
                    callback(null, data_device)
                } else {
                    callback('User Invalid', null)
                }
            }
        })
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function error_page(req, res, code, err) {
    var code = code
    var error = err
    var title = 'Error | Auth Middleware';
    ejs.renderFile(__dirname + '/views/pages/error.ejs', { title: title, error: error, code: code }, function (err, result) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' })
            res.end('An error occurred');
            callback(err)
        }
        else {
            res.writeHead(code, { 'Content-Type': 'text/html' })
            res.end(result);
        }
    })
}

exports.error = function (req, res) {
    error_page(req, res, 404, 'Not Found')
}

exports.home_page = function (req, res, callback) {
    var title = 'Home | Auth Middleware';
    ejs.renderFile(__dirname + '/views/pages/home.ejs', { title: title }, function (err, result) {
        if (!err) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(result);
        }
        else {
            res.writeHead(402, { 'Content-Type': 'text/html' })
            res.end('An error occurred');
            callback(err)
        }
    })
}

exports.register_handler = function (req, res, callback) {
    var title = 'Device Registration | Auth Middleware';
    if (req.method == "GET") {
        ejs.renderFile(__dirname + '/views/pages/register.ejs', { title: title }, function (err, result) {
            if (err != null) {
                error_page(req, res, 500, 'Internal Server Error')
                callback(err, null)
            }
            else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(result);
            }
        })
    } else if (req.method == "POST") {
        user_checker(req, res, (err, data_device) => {
            if (err) {
                error_page(req, res, 406, err)
                callback(err, null)
            } else {
                data_mongo.device_handler(data_device, (err, reply) => {
                    if (err != null) {
                        error_page(req, res, 500, 'Internal Server Error')
                        callback(err, null)
                    } else {
                        res.writeHead(301, { "Location": "http://" + req.headers['host'] + '/register' })
                        res.end();
                        callback(null, reply)
                    }
                })
            }
        })
    } else {
        error_page(req, res, 405, 'Method Not Allowed')
        callback('Method Not Allowed', null)
    }
}

// exports.login_page = function (req, res, callback) {
//     var user, title = 'Login | Auth Middleware';
//     if (req.method == 'GET') {
//         ejs.renderFile(__dirname + '/views/pages/login.ejs', { title: title, user: user }, function (err, result) {
//             // render on success
//             if (!err) {
//                 res.writeHead(200, { 'Content-Type': 'text/html' })
//                 res.end(result);
//             }
//             // render or error
//             else {
//                 res.writeHead(402, { 'Content-Type': 'text/html' })
//                 res.end('An error occurred');
//                 callback(err)
//             }
//         })
//     } else if (req.method == 'POST') {
//         login_checker(req, res, (err, data) => {
//             if (err) {
//                 res.writeHead(402, { 'Content-Type': 'text/html' })
//                 res.end('An error occurred');
//                 callback(err)
//             } else {
//                 req.session.put('user', data.username);
//                 res.writeHead(301, { "Location": "http://" + req.headers['host'] + '/register' })
//                 res.end();
//             }
//         })
//     }
// }