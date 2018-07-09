var b = require('bonescript');
var args = {
    'analogRead': ['int', ['int']]
};

var x = b.loadCModule('./ain', args, true);
var y = x.analogRead(1);