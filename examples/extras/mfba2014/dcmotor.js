var b = require('bonescript');
var MOTOR = 'P9_16';
var FORWARD = 'P9_18';
var BACKWARD = 'P9_22';
var POT = 'P9_36';
var BUTTON = 'P8_19'
var speed = 0;
var increment = 0.01;
var direction = 1;

b.pinMode(BUTTON, b.INPUT);
//b.pinMode(MOTOR, b.OUTPUT);
b.pinMode(FORWARD, b.OUTPUT);
b.pinMode(BACKWARD, b.OUTPUT);
b.digitalWrite(FORWARD, direction ? b.HIGH : b.LOW);
b.digitalWrite(BACKWARD, direction ? b.LOW : b.HIGH);
updateDuty();

function updateDuty() {
    b.analogWrite(MOTOR, speed, 60, scheduleNextUpdate);
    //console.log("Duty Cycle: " + 
    //    parseFloat(duty_cycle*100).toFixed(1) + " % " +
    //    "Position: " + position.toFixed(2));
}

function scheduleNextUpdate() {
    speed = speed + increment;
    if(speed < 0) {
        speed = 0;
        increment = -1.5*increment;
    } else if(speed > 1) {
        speed = 1;
        increment = -increment;
    }
    if(increment > 0.4) {
        increment = 0.01;
    }
    
    // call updateDuty after 20ms
    setTimeout(doRead, 20);
}

function doRead() {
    b.analogRead(POT, onRead);
}

function onRead(x) {
    if(!x.err) {
        speed = x.value;
    }
    doButtonRead();
}

function doButtonRead() {
    b.digitalRead(BUTTON, onButtonRead);
}

function onButtonRead(x) {
    if(!x.err) {
        if(direction != x.value) {
            direction = x.value;
            b.digitalWrite(FORWARD, direction ? b.HIGH : b.LOW);
            b.digitalWrite(BACKWARD, direction ? b.LOW : b.HIGH);
        }
    }
    updateDuty();
}