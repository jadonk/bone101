#!/usr/bin/env node
var b = require('bonescript');

var inputPin = "P9_38";
var outputPin = "P9_14";

b.pinMode(outputPin, b.ANALOG_OUTPUT);
loop();

function loop() {
    var value = b.analogRead(inputPin);
    // console.log("loop: value = " + value);
    b.analogWrite(outputPin, value);
    setTimeout(loop, 10);
}
