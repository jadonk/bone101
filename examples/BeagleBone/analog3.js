#!/usr/bin/env node
var b = require('bonescript');

var inputPin = "P9_36";

loop();

function loop() {
    b.analogRead(inputPin, function(resp){
        console.log(resp);
        setTimeout(loop, 10);
    });

}
