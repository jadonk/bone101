var b = require('bonescript');
var args = {
    'main': ['int', ['int']]
};

var x = b.loadCModule('./uart', args, true);
var y = x.main(1);