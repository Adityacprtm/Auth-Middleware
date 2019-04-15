module.exports = {
    User: require('./user'),
    Device: require('./device'),
    Mongo: require('./models/Mongo')
}

// var ejs = require('ejs')
// var dataMongo = require('./models/Mongo')
// var { parse } = require('querystring');
// var NodeSession = require('node-session');
// var session = new NodeSession({ secret: 'key_session' });

// function builder_page_home(req, res, data) {
//     ejs.renderFile(__dirname + '/views/pages/home.ejs', { title: data.title, user: data.user }, function (err, result) {
//         if (err != null) {
//             res.writeHead(402, { 'Content-Type': 'text/html' })
//             res.end('An error occurred');
//         }
//         else {
//             res.writeHead(200, { 'Content-Type': 'text/html' })
//             res.end(result);
//         }
//     })
// }

// function builder_page_login(req, res, data) {
//     ejs.renderFile(__dirname + '/views/pages/login.ejs', { title: data.title, user: data.user }, function (err, result) {
//         if (err != null) {
//             res.writeHead(402, { 'Content-Type': 'text/html' })
//             res.end('An error occurred');
//         }
//         else {
//             res.writeHead(200, { 'Content-Type': 'text/html' })
//             res.end(result);
//         }
//     })
// }

// function builder_page_register(req, res, data) {
//     ejs.renderFile(__dirname + '/views/pages/register.ejs', { title: data.title, user: data.user }, function (err, result) {
//         if (err != null) {
//             res.writeHead(402, { 'Content-Type': 'text/html' })
//             res.end('An error occurred');
//         }
//         else {
//             res.writeHead(200, { 'Content-Type': 'text/html' })
//             res.end(result);
//         }
//     })
// }

// module.exports = function (req, res, client, target) {
//     session.startSession(req, res, )
//     var data = {
//         username: 'aditya',
//         tittle: 'Auth Middleware'
//     }
//     if (req.method == 'GET') {
//         if (client == 'user') {
//             if (target == 'home') {
//                 builder_page_home(req, res, data)
//             } else if (target == 'login') {
//                 builder_page_login(req, res, data)
//             } else if (target == 'register') {
//                 builder_page_register(req, res, data)
//             }
//         } else if (client == 'device') {

//         } else {

//         }
//     }
// }