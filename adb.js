const Bluebird = require('bluebird')
const adb = require('@devicefarmer/adbkit').Adb;
const client = adb.createClient();
const db = require('./db')

var fs = require('fs')
const app = require('express')()
const io = require('socket.io')();

// For testing purposes only
// let devices = ['10.1.108.171', '10.1.108.213', '10.1.108.22', '10.1.108.219', '10.1.108.235'];
let port = 5555;
let pollingInt = 300 // milliseconds



exports.connectDevicesFromList = async (list) => {
    console.log('Attempting to connect to device(s)')
    list.map((device) => {
        client.connect(device, port)
            .then((resolve) => {
                return true;
            })
    })
}

exports.getDeviceStatus = async (device) => {
    let screenPower = await this.getDisplayPower(device);
    let sleepStatus = await this.getSleepStatus(device);
    return [screenPower, sleepStatus]
}

let deviceList = {};
exports.getDevices = async (id) => {
    return new Promise ((resolve) => {
        client.listDevices()
        .then((dev) => {
            deviceList = {
                qty: dev.length,
                devices: dev,
                timestamp: new Date().toISOString()
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
        this.adbCommand(id, command)
        .then((res) => {
            let splitData = (res.split('='))
            resolve(splitData)
        })
    })
}

exports.getSleepStatus = async (id) => {
    const command = 'dumpsys power | grep -e "mWakefulness="'
    return new Promise(resolve => {
        this.adbCommand(id, command)
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
// Comeback here to integrate with websocket
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


/* Howo to poll*/
/* Get latest timestamp*/
/* Comare now to most recent timestamp */
/* if timestamp is older than x minutes */
/* Get device info */
/* Insert new data to db */
/* repeat every x minutes */

exports.poll = async (interval) => {
 
    // potentially have to rewrite this function :(
    setInterval(() => {
        this.getDevices()
        .then(res => {
            for(let r in res.devices) {
                let currentDevice = res.devices[r].id
                this.getDeviceStatus(currentDevice)
                .then(status => {
                    // console.log(state)
                    // res.devices[r]['state'] = status
                })
            }
            console.log(res)
            db.adbLog(res.qty, res.devices, res.timestamp)
        })
    }, interval)
}