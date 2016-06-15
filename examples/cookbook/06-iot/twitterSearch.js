#!/usr/bin/env node
// From: https://www.npmjs.org/package/node-twitter
// The Twitter Search API can be accessed using Twitter.SearchClient. The following 
// code example shows how to search for tweets containing the keyword "node.js".var Twitter = require('node-twitter');
var key = require('./twitterKeys');

var twitterSearchClient = new Twitter.SearchClient(
    key.API_KEY, key.API_SECRET,
    key.TOKEN,   key.TOKEN_SECRET
);

twitterSearchClient.search({'q': 'rosehulman'}, function(error, result) {
    if (error) {
        console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
    }

    if (result)  {
        console.log(result);
    }
});