// Put your database code here
const Database = require('better-sqlite3')

// create database
const db = new Database("./data/log.db")

// create table
const sqlInit = `CREATE TABLE IF NOT EXISTS accesslog (id INTEGER PRIMARY KEY,
        remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT,
        httpversion TEXT, status TEXT, referer TEXT, useragent TEXT
    )`;
db.exec(sqlInit)

// create user table
const userInit = `CREATE TABLE IF NOT EXISTS userinfo (id INTEGER PRIMARY KEY,
        user TEXT, email TEXT, pass TEXT)`;
db.exec(userInit)

// create goals table
const goalInit = `CREATE TABLE IF NOT EXISTS goals (goalID INTEGER PRIMARY KEY,
    user TEXT, goal TEXT)
`
db.exec(goalInit)

//export database
module.exports = db