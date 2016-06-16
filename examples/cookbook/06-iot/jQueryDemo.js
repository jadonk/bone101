setTargetAddress('192.168.7.2', {               // <1>
    initialized: run
});

function run() {
    var b = require('bonescript');              // <2>
    var SLIDER = 'P9_36';                       // <3>
    var BUTTON = 'P8_19';
    b.pinMode(BUTTON, b.INPUT);

    getSliderStatus();                          // <4>

    function getSliderStatus() {
        b.analogRead(SLIDER, onSliderRead);     // <5>
    }

    function onSliderRead(x) {
        if (!x.err) {                           // <6>
            $('#sliderStatus').html(x.value.toFixed(3));
        }
        getButtonStatus()                       // <7>
    }

    function getButtonStatus() {
        b.digitalRead(BUTTON, onButtonRead);    // <8>
    }

    function onButtonRead(x) {
        if (!x.err) {                           // <9>
            $('#buttonStatus').html(x.value);
        }
        setTimeout(getSliderStatus, 20);        // <10>
    }
}
