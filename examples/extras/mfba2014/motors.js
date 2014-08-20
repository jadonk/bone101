var b = require('bonescript');

var SERVO = 'P9_14';
var duty_min = 0.03;
var position = 0;
var lastPosition = 0;
var increment = 0.01;
var scale = 0.090;

var MOTOR = 'P9_16';
var FORWARD = 'P9_18';
var BACKWARD = 'P9_22';
var POT = 'P9_36';
var BUTTON = 'P8_19'
var speed = 0;
var lastSpeed = 0;
var direction = true;
var increment = 0.01;

var button = false;

b.pinMode(SERVO, b.ANALOG_OUTPUT);

b.pinMode(BUTTON, b.INPUT);
b.pinMode(MOTOR, b.ANALOG_OUTPUT);
b.pinMode(FORWARD, b.OUTPUT);
b.pinMode(BACKWARD, b.OUTPUT);
b.digitalWrite(FORWARD, direction ? b.HIGH : b.LOW);
b.digitalWrite(BACKWARD, direction ? b.LOW : b.HIGH);

updateMotors();

function updateMotors() {
    if(button) {
        if(speed != lastSpeed) {
            b.analogWrite(MOTOR, Math.abs(speed), 60);
            lastSpeed = speed;
        }
        if(direction != (speed >= 0)) {
            direction = (speed >= 0);
            b.digitalWrite(FORWARD, direction ? b.HIGH : b.LOW);
            b.digitalWrite(BACKWARD, direction ? b.LOW : b.HIGH);
        }
    } else {
        if(lastSpeed != 0) {
            b.analogWrite(MOTOR, 0, 60);
            lastSpeed = 0;
        }
        var duty_cycle = (position*scale) + duty_min;
        b.analogWrite(SERVO, duty_cycle, 60);
    }
    setTimeout(doRead, 20);
}

function doRead() {
    b.analogRead(POT, onRead);
}

function onRead(x) {
    if(!x.err) {
        speed = (2.0*x.value) - 1.0;
        position = x.value;
    }
    doButtonRead();
}

function doButtonRead() {
    b.digitalRead(BUTTON, onButtonRead);
}

function onButtonRead(x) {
    if(!x.err) {
        button = (x.value == 0);
    }
    updateMotors();
}