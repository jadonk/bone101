#!/usr/bin/env node
var b = require('bonescript');

console.log('Hit ^C to stop');
b.analogRead('P1_19', printStatus);

function printStatus(x) {
    process.stdout.write('P1_19: ' + (x.value*100).toFixed(1) + '%, ' + (1.8*x.value).toFixed(3) + 'V   \r');
    b.analogRead('P1_19', printStatus);
}
