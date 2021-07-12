const adb = require('./adb')
const db = require('./db')


const main = async  () => {
    // Pull ip list from database
    let devices = await db.getDeviceWatchList();

    // Much like the conosle log says...
    console.log('Parsing db data')    
    let ipList = new Array();
    // purge unecesarry data (array of IPs)
    devices.map(device => {
        ipList.push(device.ip);
    })

    // Track ADB
    adb.trackDevices();
    // Connect to DB
    adb.connectDevicesFromList(ipList)

    adb.getDevices()
    .then(res => {
        console.log(res)
    })

    return 0;
}

console.log('Initilizing ADB-daemon v1')
// main();



// Code to log to adb data to db
// db.adbLog('10', "[ { id: '10.1.108.213:5555', type: 'device' }, { id: '10.1.108.22:5555', type: 'device' }, { id: '10.1.108.235:5555', type: 'device' }, { id: '10.1.108.219:5555', type: 'device' }, { id: '10.1.108.171:5555', type: 'device' } ]", '2021-07-12T21:16:16.713Z')
console.log(db.timeCompare('2021-07-12T21:40:37.736Z'))