var Cylon = require('cylon-beaglebone/node_modules/cylon');

Cylon.robot({
  connection: {name: 'beaglebone', adaptor: 'beaglebone'},

  devices: [
    {name: 'servo', driver: 'servo', pin: 'P9_14'},
    {name: 'button', driver: 'button', pin: 'P8_19'},
    {name: 'led', driver: 'led', pin: 'P9_42'},
    {name: 'motor', driver: 'motor', pin: 'P9_16'},
    {name: 'slider', driver: 'analogSensor', pin: 'P9_36', lowerLimit: 0, upperLimit: 1800},
    //{name: 'sensor', driver: 'ir-range-sensor', pin: 'P9_38', model: 'gp2y0a41sk0f'}
  ],

  work: function(my) {
    my.slider.on('analogRead', function(data) {
      console.log('Read : ' + data);
      my.servo.angle(((data/1800)*100)+35);
    });
    every((1).second(), function() {
      my.slider.analogRead('P9_36');
    });
  }
    
/*
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
*/
}).start();