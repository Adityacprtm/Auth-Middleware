const sqlite3 = require('sqlite3').verbose();
const CREATE_TABLE_ACCOUNTS = 'CREATE TABLE IF NOT EXISTS "accounts" ("id" INTEGER PRIMARY KEY AUTOINCREMENT,"name" TEXT NOT NULL,"email" TEXT NOT NULL UNIQUE,"username" TEXT NOT NULL UNIQUE,"password" TEXT NOT NULL,"date" TEXT,"ip" TEXT,"admin" INTEGER DEFAULT 0,"cookie" TEXT)'
const CREATE_TABLE_DEVICES = 'CREATE TABLE IF NOT EXISTS "devices" ("id" INTEGER PRIMARY KEY AUTOINCREMENT,"device_name" TEXT NOT NULL,"role" TEXT NOT NULL,"description" TEXT,"user" TEXT NOT NULL,"date" TEXT,"device_id" TEXT NOT NULL,"device_password" TEXT NOT NULL,"key" TEXT,"iv" TEXT,"ip" TEXT,"timestamp" TEXT,"token" TEXT,"topic" TEXT)'
const db = new sqlite3.Database(__dirname + '/database.db', (err) => {
    if (err) {
        console.log(err);
    }
    console.log('Connected to the database.');
});

db.serialize(function () {
    db.run(CREATE_TABLE_ACCOUNTS, (err) => {
        if (err) console.log(err)
    })

    db.run(CREATE_TABLE_DEVICES, (err) => {
        if (err) console.log(err)
    })
})

module.exports = db;