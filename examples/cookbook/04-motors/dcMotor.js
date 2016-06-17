#!/usr/bin/env node

// This is an example of driving a DC motor

var b = require('bonescript');

var motor = 'P9_16',// Pin to drive transistor
    min = 0.05,     // Slowest speed (duty cycle)
    max = 1,        // Fastest (always on)
    ms = 100,       // How often to change speed, in ms
    speed = 0.5,    // Current speed;
    step = 0.05;    // Change in speed

b.pinMode(motor, b.ANALOG_OUTPUT, 6, 0, 0, doInterval);

function doInterval(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    var timer = setInterval(sweep, ms);
}

function sweep() {
    speed += step;
    if(speed > max || speed < min) {
        step *= -1;
    }
    b.analogWrite(motor, speed);
    console.log('speed = ' + speed);
}

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearInterval(timer);       // Stop the timer
    b.analogWrite(motor, 0);    // Turn motor off
});