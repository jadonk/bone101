#!/usr/bin/env node

// This is an example of reading HC-SR04 Ultrasonic Range Finder

var b = require('bonescript');

var motor = 'P9_16',// Pin to drive transistor
    range = 'P9_41',
    min = 0.05,     // Slowest speed (duty cycle)
    max = 1,        // Fastest (always on)
    ms = 100,       // How often to change speed, in ms
    width  = 10,   // Pulse width in us
    freq   = 100,     // Frequency in Hz
    step = 0.05;    // Change in speed

b.pinMode(range, b.INPUT);      // Make sure there is on pull-up/down
b.pinMode(motor, b.ANALOG_OUTPUT);
var dutyCycle = width/1000000*freq;
b.analogWrite(motor, dutyCycle, freq);


// var timer = setInterval(sweep, ms);

// function sweep() {
//     speed += step;
//     if(speed > max || speed < min) {
//         step *= -1;
//     }
//     b.analogWrite(motor, speed);
//     console.log('speed = ' + speed);
// }

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearInterval(timer);       // Stop the timer
    b.analogWrite(motor, 0);    // Turn motor off
});