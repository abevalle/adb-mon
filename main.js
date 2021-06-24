var adb = require('adbkit');
var client = adb.createClient();



client.connect('10.28.0.13', 5555, function(err, id) {
    // let deviceId = '10.1.108.235:5555'
    let deviceId = '10.0.28.13:5555'
    console.log('Device connected')
    client.listDevices()
    .then((res) => {
        console.log(res)
    })
})


function wakeUp(id) {
    let wakeCommand = 'input keyevent KEYCODE_WAKEUP';
    client.shell(id, wakeCommand)
    .then((err, output) => {
        console.log(output)
    })
}

function reboot(id) {
    client.reboot(id, (res) => {
        if(res !== null) {
            console.log(id, ' has rebooted succesfully!')
        } else if (res !== null) {
            console.log(id, 'has failed to reboot')
        }
    })
}