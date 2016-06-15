#!/usr/bin/env node
// From: https://github.com/sandeepmistry/node-sensortag

// Reads temperature

var util = require('util');             // <1>
var async = require('async');
var SensorTag = require('sensortag');
var fs = require('fs');

console.log("Be sure sensorTag is on");

SensorTag.discover(function(sensorTag) {  // <2>
  console.log('sensorTag = ' + sensorTag);
  sensorTag.on('disconnect', function() {   // <3>
    console.log('disconnected!');
    process.exit(0);
  });

  async.series([                            // <4>
      function(callback) {
        console.log('connect');             // <5>
        sensorTag.connect(callback);
      },
      function(callback) {                  // <6>
        console.log('discoverServicesAndCharacteristics');
        sensorTag.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        console.log('enableIrTemperature'); // <7>
        sensorTag.enableIrTemperature(callback);
      },
      function(callback) {
        setTimeout(callback, 100);          // <8>
      },
      function(callback) {
        console.log('readIrTemperature');   // <9>
        sensorTag.readIrTemperature(
          function(objectTemperature, ambientTemperature) {
            console.log('\tobject  temperature = %d °C', 
                objectTemperature);
            console.log('\tambient temperature = %d °C', 
                ambientTemperature);
            callback();
        });

        sensorTag.on('irTemperatureChange', // <10>
          function(objectTemperature, ambientTemperature) {
            console.log('\tobject  temperature = %d °C', 
                objectTemperature.toFixed(1));
            console.log('\tambient temperature = %d °C\n', 
                ambientTemperature.toFixed(1));
          });

        sensorTag.notifyIrTemperature(function() {
          console.log('notifyIrTemperature');
        });
      },
      // function(callback) {
      //   console.log('disableIrTemperature'); // <11>
      //   sensorTag.disableIrTemperature(callback);
      // },
      
      function(callback) {
        console.log('readSimpleRead');          // <12> 
        sensorTag.on('simpleKeyChange', function(left, right) {
          console.log('left: ' + left + ' right: ' + right);
          if (left && right) {
            sensorTag.notifySimpleKey(callback); // <13>
          }
        });

        sensorTag.notifySimpleKey(function() {  // <14>>
        });
      },
      function(callback) {
        console.log('disconnect');
        sensorTag.disconnect(callback);         // <15>
      }
    ]
  );
});

// The MIT License (MIT)

// Copyright (c) 2013 Sandeep Mistry

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
