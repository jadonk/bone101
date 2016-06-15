#!/usr/bin/env node
// Install with npm install weather-js
var weather = require('weather-js');

// Options:
// search:     location name or zipcode
// degreeType: F or C

weather.find({search: 'Terre Haute, IN', degreeType: 'F'}, 
  function(err, result) {
    if (err) {
      console.log(err);
    }
    console.log(JSON.stringify(result, null, 2));             // <1>
    console.log(JSON.stringify(result[0].current, null, 2));  // <2>
    console.log(JSON.stringify(result[0].forecast[0], null, 2));  // <3>
  });
