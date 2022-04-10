const express = require('express');
const res = require('express/lib/response');
const { process_params } = require('express/lib/router');
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const logging = (req, res, next) => {
    console.log(req.body.number);
}

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
console.log(sec_arg + " is the second argument")
console.log(port + " is the port")


function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
}

app.get('/app', (req, res) => {
    res.status(200).end("200 OK\n");
    res.type("text/plain");
})

app.get('/app/echo/:number', logging, (req, res) => {
    res.status(200).json({'message': req.params.number});
})

app.get('/app/flip', (req, res) => {
    var flip = coinFlip();
    res.status(200).json({'flip': flip});
})

app.get('/app/flips/:number[0-9]{1,4}', (req, res) => {
    var flips = coinFlips();
    flipsObj = {}
    res.status(200).json({'flip': flip});
})

app.get('/app/flips/call/heads', (req, res) => {
    const game = flipACoin("heads")
    res.status(200).json(game)
})

app.get('/app/flips/call/tails', (req, res) => {
    const game = flipACoin("tails")
    res.status(200).json(game)
})

app.get('/app/flip/call/:guess(heads|tails)', (req, res) => {
    const game = flipACoin("tails")
    res.status(200).json(game)
})

app.get('/*', (req, res) => {
    res.status(400).end("404 Not Found")
    // res.statusCode = 404;
    // res.send("404 Not Found")
})

const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

app.use((req, res) => {
    res.status(404).send("Endpoint does not exist 😞");
    // res.type("text/plain");
})