const Bluebird = require('bluebird')
const adb = require('@devicefarmer/adbkit').Adb;
const client = adb.createClient();

var fs = require('fs')
const app = require('express')()
const io = require('socket.io')();

// For testing purposes only
// let devices = ['10.1.108.171', '10.1.108.213', '10.1.108.22', '10.1.108.219', '10.1.108.235'];
let port = 5555;

exports.connectDevicesFromList = async (list) => {
    console.log('Attempting to connect to device(s)')
    list.map((device) => {
        client.connect(device, port)
            .then((resolve) => {
                return true;
            })
    })
}
let deviceList = {};
exports.getDevices = async (id) => {
    let counter = 0;
    return new Promise ((resolve) => {
        client.listDevices()
        .then((dev) => {
            deviceList = {
                qty: dev.length,
                devices: dev,
                timestamp: new Date().toLocaleTimeString()
            }
            resolve(deviceList);
        })
    })
}

exports.adbCommand = async (id, command) => {
    return new Promise(resolve => {
        const  device = client.getDevice(id);
        device.shell(command)
        .then(adb.util.readAll)
        .then((output) => {
            resolve(output.toString().trim())
        })
    })
}

exports.getDisplayPower = async(id) => {
    const command = 'dumpsys power | grep -e "Display Power"';
    return new Promise(resolve => {
        adbCommand(id, command)
        .then((res) => {
            let splitData = (res.split('='))
            resolve(splitData)
        })
    })
}

exports.getDisplaySleepStatus = async (id) => {
    const command = 'dumpsys power | grep -e "mWakefulness="'
    return new Promise(resolve => {
        adbCommand(id, command)
        .then((res) => {
            let splitData = (res.split('='))
            resolve(splitData)
        })
    })
}

exports.getScreen = async (id) => {
    const device = client.getDevice(id);
    device.screencap().then(function(stream) {
        let cleanedID = id.replace(/[.:]/ig, "")
        stream.pipe(fs.createWriteStream(`./adbmon-${cleanedID}.png`))
    })
}


// Client tracker functions 

exports.trackDevices = async () => {
    console.log('ADB Tracking service starting')
    const tracker = await client.trackDevices();
    tracker.on('add', (device) => console.log('Device %s was plugged in', device.id));
    tracker.on('remove', (device) => console.log('Device %s was unplugged', device.id));
    tracker.on('end', () => console.log('Tracking stopped'));
}

exports.rebootDevice = (id) => {
    const device = client.getDevice(id);
    device.reboot()
    .then(res => {
        if(res) {
            console.log('[', id ,'] has rebooted')
        }
    })
}

exports.awaitDevice = (id) => {
    const device = client.getDevice(id);
    device.waitForDevice()
    .then()
}

exports.poll = async (interval) => {
    adb.getDevices()
    .then(res => {
        
    })
}