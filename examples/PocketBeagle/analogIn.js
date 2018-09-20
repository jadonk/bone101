#!/usr/bin/env node
var b = require('bonescript');
var pin = 'P1_19';

console.log('Hit ^C to stop');
b.analogRead(pin, printStatus);

function printStatus(err, x) {
    if(err) {console.log('Got error: ' + err); return;};
    process.stdout.write(pin + ': ' + (x*100).toFixed(1) + '%, ' + (1.8*x).toFixed(3) + 'V   \r');
    b.analogRead(pin, printStatus);
}
