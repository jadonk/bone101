#!/usr/bin/env node
// From: https://www.npmjs.org/package/node-twitter
// The Twitter Streaming API can be accessed using Twitter.StreamClient. 
// The following code example shows how to catch all tweets containing keywords.
var Twitter = require('node-twitter');
var b = require('bonescript');
var key = require('./twitterKeys');
var gpio = "P9_14";
var count = 0;
var timeOn = 5000;  // Turn LED off after this amount of time (in ms)

b.pinMode(gpio, b.OUTPUT);

b.digitalWrite(gpio, 1);        // Toggle LED
setTimeout(ledOff, timeOn);

var twitterStreamClient = new Twitter.StreamClient(
    key.API_KEY, key.API_SECRET,
    key.TOKEN,   key.TOKEN_SECRET
);

twitterStreamClient.on('close', function() {
    console.log('Connection closed.');
});
twitterStreamClient.on('end', function() {
    console.log('End of Line.');
});
twitterStreamClient.on('error', function(error) {
    console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
});
twitterStreamClient.on('tweet', function(tweet) {
    console.log(tweet);
    b.digitalWrite(gpio, 1);    // Turn LED on
    console.log(count++ + " =====\
    tweet\
    =====");
    setTimeout(ledOff, timeOn);
});

twitterStreamClient.start(['beagleboard', 'beaglebone', 'cookbook', 'rosehulman']);

function ledOff() {
    b.digitalWrite(gpio, 0);
}