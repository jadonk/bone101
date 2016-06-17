#!/usr/bin/env node

// Drive a simple servo motor back and forth

var b = require('bonescript');

var motor = 'P9_21', // Pin to control servo
    freq = 50,  // Servo frequency (20 ms)
    min  = 0.8, // Smallest angle (in ms)
    max  = 2.5, // Largest angle (in ms)
    ms  = 500,  // How often to change position, in ms
    pos = 1.5,  // Current position, about middle
    step = 0.1; // Step size to next position
var timer;

console.log('Hit ^C to stop');
b.pinMode(motor, b.ANALOG_OUTPUT);

pos1();

function pos1() {
    move(0.9);
    timer = setTimeout(pos2, ms);
}
function pos2() {
    move(2.1);      // Start in the middle
    timer = setTimeout(pos1, ms);
}

function move(pos) {
    var dutyCycle = pos/1000*freq;
    b.analogWrite(motor, dutyCycle, freq);
    console.log('pos = ' + pos.toFixed(3) + ' duty cycle = ' + dutyCycle.toFixed(3));
}

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearTimeout(timer);             // Stop the timer
    b.analogWrite(motor, 0, 0);    // Turn motor off
});