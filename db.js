const { Pool } = require('pg')
const dotenv = require('dotenv')
require('dotenv').config()

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

exports.addDevice = (id) => {
    pool.query('INSERT INTO devices(ip) VALUES ($1)', [id])
    .then(res => console.log(res))
}

exports.delDevice = (id) => {
    pool.query('ALTER TABLE devices WHERE id = $1 ALTER visible = true', [id])
    .then(res => console.log(res))
}

exports.getDeviceWatchList = () => { 
    console.log('Getting device list from db')
    return new Promise(resolve => {
        pool.query('SELECT * FROM devices')
        .then(res => {
            resolve(res.rows)
        })
    })
}

exports.lastPollCheck = () => {
    console.log('Checking last polling time');
    pool.query('SELECT * FROM adb_log')
    .then(res => {
        let lastPoll = new Date(res.rows[0].timerecorded).toISOString().slice(0,-5)+"Z";
        let timeSinceLastCheck = this.timeCompare(lastPoll);
        if(timeSinceLastCheck > 300000 /* 5 MINUTES */) {
            console.log('Last polling time too old!')
        } else {
            return null;
        }
    })
}

exports.timeCompare = (dbTime) => {
    let now = new Date();
    let logged = new Date(dbTime)
    let difference = now-logged
    let msUpTime = Math.floor(difference)
    return msUpTime
}

exports.adbLog = (qty, devices, timerecorded) => {
    console.log('Logging current ADB stats to DB');
    pool.query('INSERT INTO adb_log (qty, devices, timerecorded) VALUES ($1,$2,$3) ', [qty, devices, this.timestampCleaner(timerecorded)])
    .then(res => {
        console.log(res)
    })
}