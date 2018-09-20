#!/usr/bin/env node
var b = require('bonescript');
var LED = 'P1_36';  // Pin to use
var step = 0.02,    // Step size
    min = 0.02,     // dimmest value
    max = 1,        // brightest value
    brightness = min; // Current brightness;

b.pinMode(LED, b.ANALOG_OUTPUT);
setTimeout(doInterval, 200);  // work-around to wait for PWM permissions

function doInterval(err, x) {
    if(err) {
        console.log('err = ' + err);
        return;
    }
    setInterval(fade, 20);      // Step every 20 ms
}

function fade() {
    b.analogWrite(LED, brightness);
    brightness += step;
    if(brightness >= max || brightness <= min) {
        step = -1 * step;
    }
}
