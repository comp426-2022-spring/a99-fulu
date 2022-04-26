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

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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

app.use( (req, res, next) => {
    // Your middleware goes here.
    midware.addData(req, res, next)
    res.status(200)
})

// Use morgan for logging to files
const accessLog = fs.createWriteStream('./data/access.log', { flags: 'a' })
app.use(morgan('combined', { stream: accessLog }))

// endpoints
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:false, error:false});
})
app.get('/user-created/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:true, error:false});
})

app.get('/bad-login/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:false, error:true});
})

app.post('/login-user/', (req, res) => {
    let data = {
        user: req.body.username,
        pass: req.body.password
    };
    // console.log(data.user);
    // console.log(data.pass);
    try {
        const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ? AND pass = ?').get(data.user, data.pass);
        // res.status(200).json(stmt);
        // console.log(stmt);
        if(stmt){
            res.redirect('/add-goals/'+data.user)
        } else {
            res.redirect('/bad-login');
        }
    } catch(e) {
        res.redirect('/');
    }
})

app.get('/login', (req, res) => {
    res.sendFile('public/views/login/login.html' , { root : __dirname});
})

app.get('/make-account/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/make-account/make-account.html'), {message:false});
})

app.get('/user-exists/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/make-account/make-account.html'), {message:true});
})

app.post('/make-account/make/', (req, res, next) => {
    let data = {
        user: req.body.username,
        pass: req.body.password
    };

    const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ?').get(data.user);

    if(stmt){
        // res.render(path.join(__dirname, 'public/views/make-account/make-account.html'), {message:true});
        res.redirect('/user-exists');
    } else {
        const make = db.prepare('INSERT INTO userinfo (user, pass) VALUES (?, ?)');
        const info = make.run(data.user, data.pass);
        // res.render(path.join(__dirname, 'public/views/login/login.html'), {message:true});
        res.redirect('/user-created');
    }
})

app.get('/index', (req, res) => {
    res.sendFile('public/views/index.html' , { root : __dirname});
})

app.get('/home', (req, res) => {
    res.sendFile('public/views/home/home.html' , { root : __dirname});
})

app.get('/home/goals/', (req, res, next) => {
    const user = req.body.user
    const get = db.prepare(`
        SELECT goalID, goal
        FROM goals
        WHERE user='` + user + `'
    `).all()
    // const goals = get.run(user)
    res.status(200).json(get)
})

app.get('/home/goals/:username', (req, res, next) => {
    const username = req.params.user
    const get = db.prepare(`
        SELECT goal
        FROM goals
        WHERE user='` + username + `'
    `).all()
    // const goals = get.run(user)
    res.status(200).json(get);
})

app.get('/user-account-page/:user', (req, res) => {
    res.sendFile('public/views/user-account/user-account-page.html' , { root : __dirname, "user":req.params.user });
})

// ◀️ MY ENDPOINT
// 🗒️ idk how to test this out yet, but it should work
app.get('/user-account-page/:user/get', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ?').get(req.params.user);
        res.status(200).json(stmt);
    } catch (e) {
        console.error(e);
    }
})

// ◀️ MY ENDPOINT
// 🗒️ idk how to test this out yet, but it should work
app.delete("/user-account-page/delete/:username/", (req, res) => {
    const stmt = db.prepare('DELETE FROM userinfo WHERE user = ?');
    const info = stmt.run(req.params.id);
    res.status(200).json(info);
})

app.delete("/delete-goal/", (req, res) => {
    console.log(req.body.user + req.body.goal);
    const stmt = db.prepare('DELETE FROM goals WHERE user = ? AND goal = ?').run(req.body.user, req.body.goal);
    if(stmt){
        res.status(200).json({message:"success"});
    } else {
        res.status(500).json({message:"error"});
    }
    // res.status(200).json(info);
    // res.status(200).redirect(/add-goals/ + req.body.user);
})

app.get('/add-goals/:user', (req, res) => {
    let username = req.params.user;
    // res.send('public/views/add-goals/add-goals.html', {username:username});
    // res.sendFile('public/views/add-goals/add-goals.html', { root : __dirname, username:username});
    const get = db.prepare(`
        SELECT *
        FROM goals
        WHERE user='` + username + `'
    `).all()
    // const goals = get.run(user)

    res.render(path.join(__dirname, 'public/views/add-goals/add-goals.html'), {username:username, todoItems:get});
})

app.get('/add-goals', (req, res) => {
    res.sendFile('public/views/add-goals/add-goals.html' , { root : __dirname});
})
app.post('/add-goals/add/', (req, res, next) => {
    const goal = req.body.goal
    const user = req.body.user

    const add = db.prepare(`
        INSERT INTO goals (user, goal)
        VALUES (?, ?)
    `)
    add.run(user, goal)

    // res.status(200).json({"goal": goal, "user": user})
    res.status(200).redirect('/add-goals/'+user);
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
