#!/usr/bin/env node
var b = require('bonescript');
var button = 'P9_42';
var state;      // State of pushbutton

b.pinMode(button, b.INPUT, 7, 'pulldown');

state = b.digitalRead(button);
console.log('button state = ' + state);

