#!/usr/bin/env node
var b = require('bonescript');

b.analogRead('P9_36', printStatus);

function printStatus(x) {
    console.log('x.value = ' + x.value.toFixed(3));
    console.log('x.err   = ' + x.err);
}
