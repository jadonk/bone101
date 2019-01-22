#!/usr/bin/env node
var b = require('bonescript');
var LED = '/sys/class/leds/techlab::blue/brightness';
var step = 10,      // Step size
    min = 0,        // dimmest value
    max = 255,      // brightest value
    brightness = min; // Current brightness;
    
doInterval();

function doInterval(err, x) {
    if(err) {
        console.log('err = ' + err);
        return;
    }
    setInterval(fade, 20);      // Step every 20 ms
}

function fade() {
    b.writeTextFile(LED, brightness);
    brightness += step;
    if(brightness >= max || brightness <= min) {
        step = -1 * step;
    }
}