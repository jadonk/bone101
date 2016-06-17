#!/usr/bin/env node
var b = require('bonescript');
var ms = 250;  // Time in milliseconds

setInterval(readRange, ms);

function readRange() {
    b.analogRead('P9_33', printStatus);
}
function printStatus(x) {
    console.log('x.value = ' + x.value);
    console.log('Distance= ' + x.value * 1.8/0.0064);
}
