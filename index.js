// dependencies
const express = require('express');
const res = require('express/lib/response');
const { process_params } = require('express/lib/router');
const app = express();
const db = require('./data/database.js');
const midware = require('./middleware/middleware.js')
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const args = require('minimist')(process.argv.slice(2))



// middleware
app.use( (req, res, next) => {
    midware.addData(req, res, next)
    res.status(200)
})

// force express to use built-in json-parser
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// allow access to public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use morgan for logging to files
const accessLog = fs.createWriteStream('./data/access.log', { flags: 'a' })
app.use(morgan('combined', { stream: accessLog }))

// configure ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// configure the port
const port = args.port || process.env.PORT || 5000



// endpoints
// render main login page
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:false, error:false});
})

// render main page with success message
app.get('/user-created/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:true, error:false});
})

// render main page with error message
app.get('/bad-login/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/login/login.html'), {message:false, error:true});
})

// render make account page
app.get('/make-account/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/make-account/make-account.html'), {message:false});
})

// render make account page with error message
app.get('/user-exists/', (req, res) => {
    res.render(path.join(__dirname, 'public/views/make-account/make-account.html'), {message:true});
})

// make a new user & add to database
app.post('/make-account/make/', (req, res, next) => {
    let data = {
        user: req.body.username,
        pass: req.body.password
    };
    const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ?').get(data.user);
    if(stmt){
        res.redirect('/user-exists');
    } else {
        const make = db.prepare('INSERT INTO userinfo (user, pass) VALUES (?, ?)');
        const info = make.run(data.user, data.pass);
        res.redirect('/user-created');
    }
})

// login & redirect
app.post('/login-user/', (req, res) => {
    let data = {
        user: req.body.username,
        pass: req.body.password
    };
    try {
        const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ? AND pass = ?').get(data.user, data.pass);
        if(stmt){
            res.redirect('/add-goals/'+data.user)
        } else {
            res.redirect('/bad-login');
        }
    } catch(e) {
        res.redirect('/');
    }
})

// get json data for goals using body ▶️ for client side calls
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

// render user account page
app.get('/user-account-page/:user', (req, res) => {
    res.sendFile('public/views/user-account/user-account-page.html' , { root : __dirname, "user":req.params.user });
})

// get user account info json
app.get('/user-account-page/:user/get', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM userinfo WHERE user = ?').get(req.params.user);
        res.status(200).json(stmt);
    } catch (e) {
        console.error(e);
    }
})

// delete user account page
app.get("/user-account-page/:username/delete", (req, res) => {
    const stmt = db.prepare('DELETE FROM userinfo WHERE user = ?');
    const info = stmt.run(req.params.username);
    res.redirect('/')
})

// delete user account page
app.delete("/delete-goal/", (req, res) => {
    console.log(req.body.user + req.body.goal);
    const stmt = db.prepare('DELETE FROM goals WHERE user = ? AND goal = ?').run(req.body.user, req.body.goal);
    if(stmt){
        res.status(200).json({message:"success"});
    } else {
        res.status(500).json({message:"error"});
    }
})

// render add goals user page
app.get('/add-goals/:user', (req, res) => {
    let username = req.params.user;
    const get = db.prepare(`
        SELECT *
        FROM goals
        WHERE user='` + username + `'
    `).all()
    // const goals = get.run(user)

    res.render(path.join(__dirname, 'public/views/add-goals/add-goals.html'), {username:username, todoItems:get});
})

// add a goal to the database
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

// get json data for goals using body ▶️ for client side calls
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

// get json data for goals using param ▶️ for testing goals in the url
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

// required api root endpoint
app.get('/app/', (req, res, next) => {
    res.status(200).send('required api root endpoint');
})



// other
// start server
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

// endpoint doesn't exist 404
app.use((req, res) => {
    res.status(404).send("Endpoint does not exist 😞");
})





// deprecated endpoints
// // repeat login endpoint ▶️ do we need this?
// app.get('/login', (req, res) => { res.sendFile('public/views/login/login.html' , { root : __dirname});
// })
// // render goal details page ▶️ i think we can delete this, unless you guys want individual goal detail pages?
// app.get('/goal-details', (req, res) => {
//     res.sendFile('public/views/goal-details.html' , { root : __dirname});
// })
// // render index page ▶️ seems unused, we can delete this
// app.get('/index', (req, res) => {
//     res.sendFile('public/views/index.html' , { root : __dirname});
// })
// // render home page ▶️ old dashboard page, we can delete this
// app.get('/home', (req, res) => {
//     res.sendFile('public/views/home/home.html' , { root : __dirname});
// })
// // render add goals user page ▶️ i think we can delete this, we use the one above
// app.get('/add-goals', (req, res) => {
//     res.sendFile('public/views/add-goals/add-goals.html' , { root : __dirname});
// })