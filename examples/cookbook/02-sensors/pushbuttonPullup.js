#!/usr/bin/env node
var b = require('bonescript');
var buttonTop = 'P9_26';

b.pinMode(buttonTop, b.INPUT, 7, 'pullup', 'fast', doAttachTop);

function doAttachTop(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    b.attachInterrupt(buttonTop, true, b.CHANGE, printStatus);
}

var buttonBot = 'P9_42';
b.pinMode(buttonBot, b.INPUT, 7, 'pulldown', 'fast', doAttachBot);

function doAttachBot(x) {
    if(x.err) {
        console.log('x.err = ' + x.err);
        return;
    }
    b.attachInterrupt(buttonBot, true, b.CHANGE, printStatus);
}

function printStatus(x) {
    if(x.attached) {
        console.log("Interrupt handler attached");
        return;
    }

    console.log('x.value = ' + x.value);
    console.log('x.err   = ' + x.err);
}
