#!/usr/bin/env node
var b = require('bonescript');

var w1="/sys/bus/w1/devices/28-00000114ef1b/w1_slave"

setInterval(getTemp, 1000);	// read temperatue every 1000ms

function getTemp() {
    b.readTextFile(w1, printStatus);
}

function printStatus(x) {
    console.log('x.data = ' + x.data);
    console.log('x.err  = ' + x.err);
}
