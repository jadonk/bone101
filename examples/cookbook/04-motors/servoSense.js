#!/usr/bin/env node

// Bird will bow when there is a change in the sersor distance.

var b = require('bonescript');
var motor = 'P9_14';    // Pin to use
var freq = 50;   // Servo frequency (20 ms)
var up = 0.6,   // Smallest angle (in ms)
    down = 2.0,   // Largest angle (in ms)
    dutyCycle,
    ms  = 250,   // How often to change position, in ms
    oldPos = 0;

b.pinMode(motor, b.ANALOG_OUTPUT, 6, 0, 0, doInterval);

function doInterval(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    setInterval(readRange, ms);
}

move(2.0);

function readRange() {
    b.analogRead('P9_37', printStatus);
}
function printStatus(x) {
    var pos = x.value;
    console.log('pos = ' + pos);
    if (pos-oldPos>0.5) {
        move(up);
    }
    if (oldPos-pos>0.5) {
        move(down);
    }
    oldPos = pos;
}

function move(pos) {

    dutyCycle = pos/1000*freq
    b.analogWrite(motor, dutyCycle, freq);
    console.log('pos = ' + pos + ' duty cycle = ' + dutyCycle);
}
