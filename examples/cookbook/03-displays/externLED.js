#!/usr/bin/env node
var b = require('bonescript');
var LED = 'P9_14';
var state = b.HIGH;     // Initial state
b.pinMode(LED, b.OUTPUT);

setInterval(flash, 250);    // Change state every 250 ms

function flash() {
    b.digitalWrite(LED, state);
    if(state === b.HIGH) {
        state = b.LOW;
    } else {
        state = b.HIGH;
    }
}
