module.exports = (app) => {

    const logger = app.helpers.winston
    const router = require('express').Router()
    const AM = require('../auth/config/account-manager')
    const DM = require('../auth/config/device-manager')

    // Device Request
    router.post('/device/request', (req, res) => {
        logger.http('Incoming Device for %s request token from %s ', req.method, req.socket.localAddress)
        const payload = req.body
        payload['ip'] = req.ip
        payload['timestamp'] = Date.now().toString()
        // request token
        DM.request(payload, (err, data) => {
            if (err != null) {
                logger.http('Not generate token for %s, %s', req.socket.localAddress, err)
                res.format({
                    'application/json': function () {
                        res.status(401).send({ message: err });
                    }
                })
            } else {
                logger.http('Token generated for %s', req.socket.localAddress)
                res.format({
                    'application/json': function () {
                        res.status(200).send({ message: data });
                    },
                })
            }
        })
    })

    // User Web Request
    router.route('/')
        .get((req, res) => {
            // check if the user has an auto login key saved in a cookie //
            if (req.cookies.login == undefined) {
                res.render('login', { title: 'Hello - Please Login To Your Account' });
            } else {
                // attempt automatic login //
                AM.validateLoginKey(req.cookies.login, req.ip, function (e, o) {
                    if (o) {
                        AM.autoLogin(o.user, o.pass, function (o) {
                            req.session.user = o;
                            res.redirect('/home');
                        });
                    } else {
                        res.render('login', { title: 'Hello - Please Login To Your Account' });
                    }
                });
            }
        })
        .post((req, res) => {
            AM.manualLogin(req.body['user'], req.body['pass'], function (e, o) {
                if (!o) {
                    res.status(400).send(e);
                } else {
                    req.session.user = o;
                    if (req.body['remember-me'] == 'false') {
                        logger.http('User %s has login', req.session.user.user)
                        res.status(200).send(o);
                    } else {
                        AM.generateLoginKey(o.user, req.ip, function (key) {
                            logger.http('User %s has login', req.session.user.user)
                            res.cookie('login', key, { maxAge: 900000 });
                            res.status(200).send(o);
                        });
                    }
                }
            });
        })

    router.route('/signup')
        .get((req, res) => {
            res.render('signup', { title: 'Signup' });
        })
        .post((req, res) => {
            AM.addNewAccount({
                name: req.body['name'],
                email: req.body['email'],
                user: req.body['user'],
                pass: req.body['pass'],
            }, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    logger.http('User %s has registered', req.body['user'])
                    res.status(200).send('ok');
                }
            });
        })

    router.route('/home')
        .get((req, res) => {
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                res.render('home', {
                    title: 'Control Panel',
                    udata: req.session.user
                });
            }
        })
        .post((req, res) => {
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                AM.updateAccount({
                    id: req.session.user._id,
                    name: req.body['name'],
                    email: req.body['email'],
                    pass: req.body['pass'],
                }, function (e, o) {
                    if (e) {
                        res.status(400).send('error-updating-account');
                    } else {
                        req.session.user = o.value;
                        logger.http('User %s has changed the account', req.session.user.user)
                        res.status(200).send('ok');
                    }
                });
            }
        })

    router.route('/device')
        .get((req, res) => {
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                var user = req.session.user.user
                DM.getDevice(user, (err, devices) => {
                    res.render('device', {
                        title: 'Device List',
                        dvc: devices
                    })
                })
            }
        })

    router.get('/api/device', (req, res) => {
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            var user = req.session.user.user
            DM.getDevice(user, (err, devices) => {
                res.json(devices)
            })
        }
    })

    router.route('/register')
        .get((req, res) => {
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                var user = req.session.user.user
                DM.getDevice(user, (err, devices) => {
                    res.render('addDevice', {
                        title: 'Register Device',
                        dvc: devices
                    })
                })
            }
        })
        .post((req, res) => {
            DM.addDevice({
                device_name: req.body['device_name'],
                role: req.body['role'],
                description: req.body['description'],
                user: req.session.user.user,
                date: new Date().toLocaleString()
            }, (err) => {
                if (err) {
                    res.status(400).send(err);
                } else {
                    logger.http('User %s has register the device', req.session.user.user)
                    res.status(200).send('ok');
                }
            })
        })

    router.post('/delete', function (req, res) {
        AM.deleteAccount(req.session.user._id, function (e, obj) {
            if (!e) {
                logger.http('User %s has deleted the account', req.session.user.user)
                res.clearCookie('login');
                req.session.destroy(function (e) { res.status(200).send('ok'); });
            } else {
                res.status(400).send('record not found');
            }
        });
    });

    router.get('/print', function (req, res) {
        AM.getAllRecords(function (e, accounts) {
            res.render('print', { title: 'Account List', accts: accounts });
        })
    });

    router.post('/logout', (req, res) => {
        res.clearCookie('login');
        req.session.destroy(function (e) { res.status(200).send('ok'); });
    })

    router.get('*', function (req, res) { res.render('404', { title: 'Page Not Found' }); });

    return router
}
