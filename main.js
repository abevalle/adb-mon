const adb = require('./adb')
const db = require('./db')


/* 
ToDo:
* Check if there are IPs in the DB
* Shutdown, Reboot function
* Polling screenshot

Long Term todo:
* Upload Apk and install apk to certain devices
* Process explorer - Kill, restart
*/


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

    adb.poll(10000);
    return 0;
}

console.log('Initilizing ADB-daemon v1')
main();
