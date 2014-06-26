var Cylon = require('cylon-beaglebone/node_modules/cylon');

Cylon.robot({
  connection: {name: 'beaglebone', adaptor: 'beaglebone'},

  device: {name: 'servo', driver: 'servo', pin: 'P9_14'},

  work: function(my) {
    var angle = 45 ;
    my.servo.angle(angle);
    every((1).second(), function() {
      angle = angle + 45 ;
      if (angle > 135) {
        angle = 45
      }
      my.servo.angle(angle);
    });
  }
}).start();