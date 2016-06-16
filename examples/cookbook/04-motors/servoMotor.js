#!/usr/bin/env node

// Drive a simple servo motor back and forth

var b = require('bonescript');

var motor = 'P9_21', // Pin to control servo
    freq = 50,  // Servo frequency (20 ms)
    min  = 0.8, // Smallest angle (in ms)
    max  = 2.5, // Largest angle (in ms)
    ms  = 250,  // How often to change position, in ms
    pos = 1.5,  // Current position, about middle
    step = 0.1; // Step size to next position

console.log('Hit ^C to stop');
b.pinMode(motor, b.ANALOG_OUTPUT, 6, 0, 0, doInterval);

function doInterval(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    timer = setInterval(sweep, ms);
}

move(pos);      // Start in the middle

// Sweep from min to max position and back again
function sweep() {
    pos += step;    // Take a step
    if(pos > max || pos < min) {
        step *= -1;
    }
    move(pos);
}

function move(pos) {
    var dutyCycle = pos/1000*freq;
    b.analogWrite(motor, dutyCycle, freq);
    console.log('pos = ' + pos + ' duty cycle = ' + dutyCycle);
}

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearInterval(timer);             // Stop the timer
    b.analogWrite(motor, 0, freq);    // Turn motor off
});