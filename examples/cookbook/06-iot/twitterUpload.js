#!/usr/bin/env node
// From: https://www.npmjs.org/package/node-twitter
// Tweets with attached image media (JPG, PNG or GIF) can be posted 
// using the upload API endpoint.
var Twitter = require('node-twitter');
var b = require('bonescript');
var key = require('./twitterKeys');

var twitterRestClient = new Twitter.RestClient(
    key.API_KEY, key.API_SECRET,
    key.TOKEN,   key.TOKEN_SECRET
);

twitterRestClient.statusesUpdateWithMedia(
    {
        'status': 'Posting a tweet w/ attached media.',
        'media[]': '/root/cookbook-atlas/images/cover.png'
    },
    function(error, result) {
        if (error)  {
            console.log('Error: ' + 
                (error.code ? error.code + ' ' + error.message : error.message));
        }

        if (result)  {
            console.log(result);
        }
    }
);

// node-twitter is made available under terms of the BSD 3-Clause License.
// http://www.opensource.org/licenses/BSD-3-Clause