#!/usr/bin/env node
var b = require('bonescript');

var inputPin = "P1_19";
var outputPin = "P1_36";

console.log('Hit ^C to stop');
b.pinMode(outputPin, b.ANALOG_OUTPUT);
setTimeout(loop, 200);  // work-around to wait for PWM permissions

function loop() {
    var value = b.analogRead(inputPin);
    process.stdout.write(inputPin + '-->' + outputPin + ': ' + (value*100).toFixed(1) + '%   \r');
    b.analogWrite(outputPin, value);
    setTimeout(loop, 10);
}
