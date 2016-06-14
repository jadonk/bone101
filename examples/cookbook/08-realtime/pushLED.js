#!/usr/bin/env node
var b = require('bonescript');
var button = 'P9_42';
var LED    = 'P9_14';

b.pinMode(button, b.INPUT, 7, 'pulldown', 'fast', doAttach);
function doAttach(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    b.attachInterrupt(button, true, b.CHANGE, flashLED);
}

b.pinMode(LED,    b.OUTPUT);

function flashLED(x) {
    if(x.attached) {
        console.log("Interrupt handler attached");
        return;
    }
    console.log('x.value = ' + x.value);
    console.log('x.err   = ' + x.err);
    b.digitalWrite(LED, x.value);
}
