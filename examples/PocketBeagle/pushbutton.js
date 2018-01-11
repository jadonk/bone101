#!/usr/bin/env node
var b = require('bonescript');
var button = "P2_3";

console.log('Hit ^C to stop');
b.pinMode(button, b.INPUT, 7, 'pulldown', 'fast', doAttach);

function doAttach(x) {
    if(x.err) {
        console.log('err = ' + x.err);
        return;
    }
    b.attachInterrupt(button, true, b.CHANGE, printStatus);
}

function printStatus(x) {
    if(x.attached) {
        console.log("Interrupt handler attached");
        return;
    }
    process.stdout.write('value = ' + x.value + ', err   = ' + x.err + '          \r');
}

