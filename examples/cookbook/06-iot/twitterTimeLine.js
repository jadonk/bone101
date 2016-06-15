#!/usr/bin/env node
// From: https://www.npmjs.org/package/node-twitter
// The Twitter REST API can be accessed using Twitter.RestClient. The following 
// code example shows how to retrieve tweets from the authenticated user's timeline.
var Twitter = require('node-twitter');
var key = require('./twitterKeys');

var twitterRestClient = new Twitter.RestClient(
    key.API_KEY, key.API_SECRET,
    key.TOKEN,   key.TOKEN_SECRET
);

twitterRestClient.statusesHomeTimeline({}, function(error, result) {
    if (error) {
        console.log('Error: ' + 
            (error.code ? error.code + ' ' + error.message : error.message));
    }

    if (result) {
        console.log(result);
    }
});

// node-twitter is made available under terms of the BSD 3-Clause License.
// http://www.opensource.org/licenses/BSD-3-Clause