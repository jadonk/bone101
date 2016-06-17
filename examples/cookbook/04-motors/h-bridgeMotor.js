#!/usr/bin/env node

// This example uses an H-bridge to drive a DC motor in two directions

var b = require('bonescript');

var enable = 'P9_21';    // Pin to use for PWM speed control
    in1    = 'P9_15',
    in2    = 'P9_16',
    step = 0.05,    // Change in speed
    min  = 0.05,    // Min duty cycle
    max  = 1.0,     // Max duty cycle
    ms   = 100,     // Update time, in ms
    speed = min;    // Current speed;

b.pinMode(enable, b.ANALOG_OUTPUT, 6, 0, 0, doInterval);
b.pinMode(in1, b.OUTPUT);
b.pinMode(in2, b.OUTPUT);

function doInterval(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    timer = setInterval(sweep, ms);
}

clockwise();        // Start by going clockwise

function sweep() {
    speed += step;
    if(speed > max || speed < min) {
        step *= -1;
        step>0 ? clockwise() : counterClockwise();
    }
    b.analogWrite(enable, speed);
    console.log('speed = ' + speed);
}

function clockwise() {
    b.digitalWrite(in1, b.HIGH);
    b.digitalWrite(in2, b.LOW);
}

function counterClockwise() {
    b.digitalWrite(in1, b.LOW);
    b.digitalWrite(in2, b.HIGH);
}

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearInterval(timer);         // Stop the timer
    b.analogWrite(enable, 0);     // Turn motor off
});