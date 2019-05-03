const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const ACCOUNT_DB = 'accounts',
	URI = 'mongodb://127.0.0.1:27017/',
	DB = 'auth-middleware'

var db, accounts;
MongoClient.connect(URI, { useNewUrlParser: true }, function (e, client) {
	if (e) {
		console.log(e);
	} else {
		db = client.db(DB);
		accounts = db.collection(ACCOUNT_DB);
		// index fields 'user' & 'email' for faster new account validation //
		accounts.createIndex({ user: 1, email: 1 });
	}
});

const guid = function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16);
	});
}

/*
	login validation methods
*/

exports.autoLogin = function (user, pass, callback) {
	accounts.findOne({ user: user }, function (e, o) {
		if (o) {
			o.pass == pass ? callback(o) : callback(null);
		} else {
			callback(null);
		}
	});
}

exports.manualLogin = function (user, pass, callback) {
	accounts.findOne({ user: user }, function (e, o) {
		if (o == null) {
			callback('user-not-found');
		} else {
			validatePassword(pass, o.pass, function (err, res) {
				if (res) {
					callback(null, o);
				} else {
					callback('invalid-password');
				}
			});
		}
	});
}

exports.generateLoginKey = function (user, ipAddress, callback) {
	let cookie = guid();
	accounts.findOneAndUpdate({ user: user }, {
		$set: {
			ip: ipAddress,
			cookie: cookie
		}
	}, { returnOriginal: false }, function (e, o) {
		callback(cookie);
	});
}

exports.validateLoginKey = function (cookie, ipAddress, callback) {
	// ensure the cookie maps to the user's last recorded ip address //
	accounts.findOne({ cookie: cookie, ip: ipAddress }, callback);
}

/*
	record insertion, update & deletion methods
*/

exports.addNewAccount = function (newData, callback) {
	accounts.findOne({ user: newData.user }, function (e, o) {
		if (o) {
			callback('username-taken');
		} else {
			accounts.findOne({ email: newData.email }, function (e, o) {
				if (o) {
					callback('email-taken');
				} else {
					saltAndHash(newData.pass, function (hash) {
						newData.pass = hash;
						// append date stamp when record was created //
						newData.date = new Date().toString()
						accounts.insertOne(newData, callback);
					});
				}
			});
		}
	});
}

exports.updateAccount = function (newData, callback) {
	let findOneAndUpdate = function (data) {
		var o = {
			name: data.name,
			email: data.email,
		}
		if (data.pass) o.pass = data.pass;
		accounts.findOneAndUpdate({ _id: getObjectId(data.id) }, { $set: o }, { returnOriginal: false }, callback);
	}
	if (newData.pass == '') {
		findOneAndUpdate(newData);
	} else {
		saltAndHash(newData.pass, function (hash) {
			newData.pass = hash;
			findOneAndUpdate(newData);
		});
	}
}

/*
	account lookup methods
*/

exports.getAllRecords = function (callback) {
	accounts.find().toArray(
		function (e, res) {
			if (e) callback(e)
			else callback(null, res)
		});
}

exports.deleteAccount = function (user, callback) {
	accounts.deleteOne({ user: user }, (err, o) => {
		if (err) { callback(err, null) }
		else (callback(null, o))
	});
}

/*
	private encryption & validation methods
*/

var generateSalt = function () {
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function (str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function (pass, callback) {
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function (plainPass, hashedPass, callback) {
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function (id) {
	return new require('mongodb').ObjectID(id);
}

