#!/usr/bin/env node
var b = require('bonescript');

var leds = ["USR0", "USR1", "USR2", "USR3", "P9_14"];

for(var i in leds) {
    b.pinMode(leds[i], b.OUTPUT);
}

// b.pinMode("P9_14", b.INPUT);

var state = b.LOW;
for(var i in leds) {
    b.digitalWrite(leds[i], state);
}

setInterval(toggle, 1000);

function toggle() {
    if(state == b.LOW) state = b.HIGH;
    else state = b.LOW;
    for(var i in leds) {
        b.digitalWrite(leds[i], state);
    }
}
