#!/usr/bin/node
// 'childprocess' help at:
// http://nodejs.org/api/child_process.html\
//                    #child_process_child_process_spawn_command_args_options
"use strict";

var b = require('bonescript'),
    spawn = require('child_process').spawn;

var audioRate = 48000,
    bufferSize = 4800,
    format = "S16_LE";  // 16-bit signed, little endian
    
var audioIn = spawn(
           "/usr/bin/arecord",
           [
            "-c2", "-r"+audioRate, "-f"+format, "-traw", 
            "--buffer-size="+bufferSize, "--period-size="+bufferSize, "-N"
           ]
        );
        
 var audioOut = spawn(
           "/usr/bin/aplay",
           [
            "-c2", "-r"+audioRate, "-f"+format, "-traw", 
            "--buffer-size="+bufferSize, "--period-size="+bufferSize, "-N"
           ]
        );     
    
    audioIn.stdout.on('data', function(data) {
        audioOut.stdin.write(data);
    });
    
    audioIn.on('close', function(code) {
        if(code !== 0) {
            console.log('arecord process exited with code: ' + code);
            audioOut.stdin.end();
        }
    })
    
    audioOut.on('close', function(code) {
        if(code !== 0) {
            console.log('aplay process exited with code: ' + code);
        }
    })
    