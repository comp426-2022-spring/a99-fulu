const express = require('express');
const res = require('express/lib/response');
const { process_params } = require('express/lib/router');
const app = express();
const Database = require('better-sqlite3');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const logging = (req, res, next) => {
    console.log(req.body.number);
}

app.use(express.static(path.join(__dirname, 'public')));

// args
sec_arg = process.argv.slice(2);
let sec_arg_num;
if (sec_arg.toString().includes('=')) {
    const index = sec_arg.toString().indexOf('=');
    sec_arg_num = sec_arg.toString().substring(index+1);
}
const port_from_sec_arg = parseInt(sec_arg_num);
if(port_from_sec_arg > 0 && port_from_sec_arg < 65536) {
    port = sec_arg_num;
} else {
    port = 5000;
}
// console.log(sec_arg + " is the second argument")
// console.log(port + " is the port")


// create database
const db = new Database('log.db')

// create table
const sqlInit = `CREATE TABLE IF NOT EXISTS accesslog (id INTEGER PRIMARY KEY,
        remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT,
        httpversion TEXT, secure TEXT, status INTEGER, referer TEXT, useragent TEXT
    )`;
db.exec(sqlInit)

const addData = (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const prep = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol,
        httpversion, status, referer, useragent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    prep.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, 
        logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next()
}

// Use morgan for logging to files
// Create a write stream to append (flags: 'a') to a file
const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
// Set up the access logging middleware
app.use(morgan('combined', { stream: accessLog }))

// middleware adds data to table
app.use( (req, res, next) => {
    // Your middleware goes here.
    addData(req, res, next)
    res.status(200)
})

app.get('/', (req, res) => {
    // res.status(200).send("./public/views/index.html");
    res.sendFile('public/index.html' , { root : __dirname});
    // res.send("./public/views/index.html");
})

app.get('/add-goals', (req, res) => {
    res.status(200).send("./public/views/add-goals.html");
})

app.get('/goal-details', (req, res) => {
    res.status(200).send("./public/views/goal-details.html");
})

app.get('/home', (req, res) => {
    res.status(200).send("./public/views/home.html");
})

app.get('/login', (req, res) => {
    res.status(200).send("./public/views/login.html");
})

app.get('/make-account', (req, res) => {
    res.status(200).send("./public/views/make-account.html");
})

app.get('/user-account-page', (req, res) => {
    res.status(200).send("./public/views/user-account-page.html");
})
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

app.use((req, res) => {
    res.status(404).send("Endpoint does not exist 😞");
    // res.type("text/plain");
})
