var Cylon = require('cylon-beaglebone/node_modules/cylon');

Cylon.robot({
  connection: {name: 'beaglebone', adaptor: 'beaglebone'},

  device: {
    name: 'sensor',
    driver: 'ir-range-sensor',
    pin: 'P9_38',
    model: 'gp2y0a41sk0f'
  },

  work: function(my) {
    every((1).seconds(), function(){
      var range = my.sensor.range();
      console.log('Range ===>', range);
    });
  }

}).start();
