#!/usr/bin/env node

// Drive a simple servo motor back and forth

var b = require('bonescript');

var motor = 'P1_36', // Pin to control servo
    freq = 50,  // Servo frequency (20 ms)
    min  = 0.5, // Smallest angle (in ms)
    max  = 2.5, // Largest angle (in ms)
    ms  = 50,  // How often to change position, in ms
    pos = 1.5,  // Current position, about middle
    step = 0.01; // Step size to next position

console.log('Hit ^C to stop');
b.pinMode(motor, b.ANALOG_OUTPUT, 2, 0, 0);
setTimeout(startMoving, 200);  // work-around to wait for PWM permissions

function startMoving() {
    move(pos);      // Start in the middle
    timer = setInterval(sweep, ms);
}

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
    process.stdout.write('pulse = ' + pos.toFixed(2) + 'ms, duty cycle = ' + (dutyCycle*100).toFixed(1) + "%    \r");
}

process.on('SIGINT', function() {
    console.log('Got SIGINT, turning motor off');
    clearInterval(timer);             // Stop the timer
    b.analogWrite(motor, 0, freq);    // Turn motor off
    b.pinMode(motor, b.OUTPUT);
    b.digitalWrite(motor, 1);
});
