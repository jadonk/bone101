var b = require('bonescript');
var args = {
    'blink': ['int', ['int']]
};

var x = b.loadCModule('./blink', args, true);
var y = x.blink.async(b.mraaGPIO('P9_12'), function (err, res) {});