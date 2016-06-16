#!/usr/bin/env node
// Initial idea from Getting Started With node.js and socket.io
// by Constantine Aaron Cois, Ph.D. (www.codehenge.net)
// http://codehenge.net/blog/2011/12/getting-started-with-node-js-and-socket-io-v0-7-part-2/
// This is a simple server for the various web frontends
"use strict";

var port = 9090,            // Port on which to listen
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    b = require('bonescript');

var server = http.createServer(servePage);  // <1>

server.listen(port);                        // <2>
console.log("Listening on " + port);

function servePage(req, res) {
    var path = url.parse(req.url).pathname;             // <3>
    console.log("path: " + path);

    fs.readFile(__dirname + path, function (err, data) {// <4>
        if (err) {                                      // <5>
            return send404(res); 
        }
        res.write(data, 'utf8');                        // <6>
        res.end();
    });   
}

function send404(res) {
    res.writeHead(404);
    res.write('404 - page not found');
    res.end();
}
