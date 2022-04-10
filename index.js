// require things
const express = require('express');
const res = require('express/lib/response');
const { process_params } = require('express/lib/router');
const app = express();
const db = require('./data/database.js');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

// force express to use built-in json-parser
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// allow access to public directory
app.use(express.static(path.join(__dirname, 'public')));

// parse args
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

// adds logdata to table with middleware
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
// app.use( (req, res, next) => {
//     // Your middleware goes here.
//     addData(req, res, next)
//     res.status(200)
// })

// Use morgan for logging to files
const accessLog = fs.createWriteStream('./data/access.log', { flags: 'a' })
app.use(morgan('combined', { stream: accessLog }))

// endpoints
app.get('/', (req, res) => {
    res.sendFile('public/views/index.html' , { root : __dirname});
})

app.get('/index', (req, res) => {
    res.sendFile('public/views/index.html' , { root : __dirname});
})

app.get('/add-goals', (req, res) => {
    res.sendFile('public/views/add-goals.html' , { root : __dirname});
})

app.get('/goal-details', (req, res) => {
    res.sendFile('public/views/goal-details.html' , { root : __dirname});
})

app.get('/home', (req, res) => {
    res.sendFile('public/views/home.html' , { root : __dirname});
})

app.get('/login', (req, res) => {
    res.sendFile('public/views/login/login.html' , { root : __dirname});
})

app.get('/make-account', (req, res) => {
    res.sendFile('public/views/make-account/make-account.html' , { root : __dirname});
})

app.get('/user-account-page', (req, res) => {
    res.sendFile('public/views/user-account-page.html' , { root : __dirname});
})

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

app.use((req, res) => {
    res.status(404).send("Endpoint does not exist 😞");
})
