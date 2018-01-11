#!/usr/bin/env node
var b = require('bonescript');
var pin = 'P1_19';

console.log('Hit ^C to stop');
b.analogRead(pin, printStatus);

function printStatus(x) {
    process.stdout.write(pin + ': ' + (x.value*100).toFixed(1) + '%, ' + (1.8*x.value).toFixed(3) + 'V   \r');
    b.analogRead(pin, printStatus);
}
