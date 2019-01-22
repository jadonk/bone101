#!/usr/bin/env node
var b = require('bonescript');
var XINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_x_raw';
var YINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_y_raw';
var ZINPUT = '/sys/bus/iio/devices/iio:device1/in_accel_z_raw';
var XOUTPUT = '/sys/class/leds/techlab::red/brightness';
var YOUTPUT = '/sys/class/leds/techlab::green/brightness';
var ZOUTPUT = '/sys/class/leds/techlab::blue/brightness';

b.writeTextFile('/sys/devices/platform/ocp/ocp\:P1_33_pinmux/state', 'pwm');

console.log('Hit ^C to stop');
updateStatus();

function updateStatus() {
  var x = b.abs(b.readTextFile(XINPUT).trim());
  var y = b.abs(b.readTextFile(YINPUT).trim());
  var z = b.abs(b.readTextFile(ZINPUT).trim());
  b.writeTextFile(XOUTPUT, x);
  b.writeTextFile(YOUTPUT, y);
  b.writeTextFile(ZOUTPUT, z);
  setTimeout(updateStatus, 100);
}
