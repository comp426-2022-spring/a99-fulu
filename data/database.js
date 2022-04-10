// Put your database code here
const Database = require('better-sqlite3')

// create database
const db = new Database("./data/db/log.db")

// create table
const sqlInit = `CREATE TABLE IF NOT EXISTS accesslog (id INTEGER PRIMARY KEY,
        remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT,
        httpversion TEXT, status TEXT, referer TEXT, useragent TEXT
    )`;
db.exec(sqlInit)

module.exports = db