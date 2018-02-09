var b = require('bonescript');
var leds = ['USR0', 'USR1', 'USR2', 'USR3'];
var i = 0;
var delay = 100;

console.log("Toggling LEDs:");
for(var x in leds) {
    b.pinMode(leds[x], b.OUTPUT);
    process.stdout.write("0");
}
ledOn();

function ledOn() {
    process.stdout.write("\x1b[" + (n(i)+1) + "G1");
    b.digitalWrite(leds[n(i)], b.HIGH);
    setTimeout(ledOff, delay);
}

function ledOff() {
    process.stdout.write("\x1b[" + (n(i)+1) + "G0");
    b.digitalWrite(leds[n(i)], b.LOW);
    i++; if(i >= 2*leds.length-2) i = 0;
    //i++; if(i > 3) i = 0;
    ledOn();
}

function n(i) {
    if(i >= leds.length) return 2*leds.length-i-2;
    else return i;
}
