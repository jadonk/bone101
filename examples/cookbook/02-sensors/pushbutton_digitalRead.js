#!/usr/bin/env node
var b = require('bonescript');
var button = 'P9_42';

b.pinMode(button, b.INPUT, 7, 'pulldown');
b.digitalRead(button, printStatus);

function printStatus(x) {
    console.log('x.value = ' + x.value);
    console.log('x.err   = ' + x.err);
}
