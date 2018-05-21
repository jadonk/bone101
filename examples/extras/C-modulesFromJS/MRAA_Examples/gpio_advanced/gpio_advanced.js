var b = require('bonescript');
var args = {
    'gpio_advanced': ['int', ['int']]
};

var x = b.loadCModule('./gpio_advanced', args, true);
var y = x.gpio_advanced(b.mraaGPIO('P8_10'));