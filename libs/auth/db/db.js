const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/database.db', (err) => {
    if (err) {
        console.log(err);
    }
    console.log('Connected to the database.');
});

module.exports = db;