var b = require('bonescript');
var args = {
    'main': ['int', ['int']]
};

var x = b.loadCModule('./spi', args, true);
var y = x.main.async(1, function (err, res) {});