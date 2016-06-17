#!/usr/bin/env node
var b = require('bonescript');
var motor = 'P9_14';    // Pin to use
var freq = 80;          // Servo frequency
var dir = 0.001, // Direction
    min = 0.05,
    max = 0.15,
    ms = 50,
    pos = min; // Current position;

b.pinMode(motor, b.ANALOG_OUTPUT);

setInterval(move, ms);

function move() {
    pos += dir;
    if(pos > max || pos < min) {
        dir = -1 * dir;
    }
    b.analogWrite(motor, pos, freq);
    console.log('pos = ' + pos);
}
