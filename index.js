// require things
const express = require('express');
const res = require('express/lib/response');
const { process_params } = require('express/lib/router');
const app = express();
const db = require('./data/database.js');
const midware = require('./middleware/middleware.js')
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
    res.sendFile('public/views/login/login.html' , { root : __dirname});
})

app.get('/login', (req, res) => {
    res.sendFile('public/views/login/login.html' , { root : __dirname});
})

app.get('/make-account', (req, res) => {
    res.sendFile('public/views/make-account/make-account.html' , { root : __dirname});
})
app.post('/make-account/make/', (req, res, next) => {
    const username = req.body.user
    const password = req.body.pass
    // todo: middleware to add the new user to the database
    // todo: i also have no idea how to check to make sure the user isn't already in the database
    addUser(username, password)
    res.status(200).json({user: username, pass: password})
})

app.get('/index', (req, res) => {
    res.sendFile('public/views/index.html' , { root : __dirname});
})

app.get('/home', (req, res) => {
    res.sendFile('public/views/home/home.html' , { root : __dirname});
})
app.get('/home/goals/:user', (req, res, next) => {
    const user = req.params.user
    const get = db.prepare(`
        SELECT goalID, goal
        FROM goals
        WHERE user='` + user + `'
    `).all()
    // const goals = get.run(user)
    res.status(200).json(get)
})

app.get('/user-account-page', (req, res) => {
    res.sendFile('public/views/user-account/user-account-page.html' , { root : __dirname});
})
app.get('/user-account-page/:username/', (req, res) => {
    // todo: make userDetails middleware
    const userDetails = getUserDetails(req.params.username)
    res.status(200).json(userDetails)
})
app.delete('/user-account-page/delete/:username/', (req, res) => {
    // todo: write delete endpoint
    // the endpoint is supposed to delete the user's account and then redirect to login page
    // i have no idea what the structure of a delete endpoint looks like
})

app.get('/add-goals', (req, res) => {
    res.sendFile('public/views/add-goals.html' , { root : __dirname});
})
app.post('/add-goals/add/', (req, res, next) => {
    const goal = req.body.goal
    const user = req.body.user

    const add = db.prepare(`
        INSERT INTO goals (user, goal)
        VALUES (?, ?)
    `)
    add.run(user, goal)

    res.status(200).json({"goal": goal, "user": user})
})

app.get('/goal-details', (req, res) => {
    res.sendFile('public/views/goal-details.html' , { root : __dirname});
})

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

app.use((req, res) => {
    res.status(404).send("Endpoint does not exist 😞");
})
