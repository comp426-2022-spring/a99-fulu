// add middleware
const db = require('../data/database.js')

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

const addGoal = (req, res, next) => {
    const goal = req.body.goal
    const user = req.body.user
    const add = db.prepare(`
        INSERT INTO goals (user, goal)
        VALUES (?, ?)
    `)
    add.run(user, goal)
    next()
}

module.exports = {addData, addGoal}