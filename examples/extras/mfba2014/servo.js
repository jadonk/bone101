var b = require('bonescript');
var SERVO = 'P9_14';
var duty_min = 0.03;
var position = 0;
var increment = 0.01;
var scale = 0.090;

//b.pinMode(SERVO, b.ANALOG_OUTPUT);
b.analogWrite(SERVO, 0);
updateDuty();

function updateDuty() {
    // compute and adjust duty_cycle based on
    // desired position in range 0..1
    var duty_cycle = (position*scale) + duty_min;
    b.analogWrite(SERVO, duty_cycle, 60, scheduleNextUpdate);

    //console.log("Duty Cycle: " + 
    //    parseFloat(duty_cycle*100).toFixed(1) + " % " +
    //    "Position: " + position.toFixed(2));
}

function scheduleNextUpdate() {
    // adjust position by increment and 
    // reverse if it exceeds range of 0..1
    position = position + increment;
    if(position < 0) {
        position = 0;
        increment = -1.5*increment;
    } else if(position > 1) {
        position = 1;
        increment = -increment;
    }
    if(increment > 0.4) {
        increment = 0.01;
    }
    
    // call updateDuty after 20ms
    setTimeout(doRead, 20);
}

function doRead() {
    b.analogRead('P9_36', onRead);
}

function onRead(x) {
    if(!x.err) {
        position = x.value;
    }
    updateDuty();
}
