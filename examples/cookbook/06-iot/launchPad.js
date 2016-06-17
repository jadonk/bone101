#!/usr/bin/env node
// Need to add exports.serialParsers = m.module.parsers;
// to /usr/local/lib/node_modules/bonescript/serial.js

var b = require('bonescript');

var port = '/dev/ttyO1';                    // <1>
var options = {
    baudrate: 9600,                         // <2>
    parser: b.serialParsers.readline("\n")  // <3>
};

b.serialOpen(port, options, onSerial);      // <4>


function onSerial(x) {                      // <5>
    console.log(x.event);
    if (x.err) {
        console.log('***ERROR*** ' + JSON.stringify(x));
    }
    if (x.event == 'open') {
        console.log('***OPENED***');
        setInterval(sendCommand, 1000);     // <6>
    }
    if (x.event == 'data') {
        console.log(String(x.data));
    }
}

var command = ['r', 'g'];                   // <7>
var commIdx = 1;

function sendCommand() {
    // console.log('Command: ' + command[commIdx]);
    b.serialWrite(port, command[commIdx++]); // <8>
    if(commIdx >= command.length) {         // <9>
        commIdx = 0;
    }
}