var address = window.location.host;
var port = 5001;
var connected = false;
var socketLoadTimeout = false;
var handlers = {initialized: run, timeout: noBoneScript};
setTargetAddress(address, handlers);

var sensors = {};
var slides = $('#slides').children();

document.onkeydown = onkd;
$('#processing').show(startProc);

function run() {
    console.log('Connected to ' + address);
    var b = require('bonescript');
    
    var sourceJS = '/examples/extras/sensortag/sensortag.js';
    var targetJS = '/var/lib/cloud9/autorun/sensortag.js';
    b.getPlatform(onGetPlatform);

    function onGetPlatform(platform) {
        console.log("Running BoneScript version " + platform.bonescript);
        b.setDate(Date().toString(), onSetDate);
    }

    function onSetDate() {
        console.log("Reading " + sourceJS);
        jQuery.get(sourceJS, onJSReadSuccess, 'text').fail(onJSReadFail);
    }

    function onJSReadSuccess(contentsJS) {
        console.log("Writing " + targetJS);
        b.writeTextFile(targetJS, contentsJS, onJSWritten);
    }

    function onJSReadFail() {
        console.log("Failed to read " + targetJS);
    }
    
    function onJSWritten() {
        connectSocket();
    }
}

function noBoneScript() {
    console.log("BoneScript not found")
}

function connectSocket() {
    var path = 'http://' + address + ':' + port + '/socket.io/socket.io.js';
    console.log("Attempting to fetch " + path);
    socketLoadTimeout = setTimeout(onSocketFail, 10000);
    $.getScript(path).done(onSocketIOLoad).fail(onSocketFail);
}

function onSocketFail(jqxhr, settings, exception) {
    console.log("Load failed...");
    if(socketLoadTimeout) clearTimeout(onSocketFail);
    setTimeout(connectSocket, 3000);
}

function onSocketIOLoad(script, status) {
    connected = false;
    if(socketLoadTimeout) clearTimeout(socketLoadTimeout);
    console.log("Load status: " + status);
    socket = new io.connect('http://' + address + ':' + port);
    socket.on('data', onData);
}

function onData(data) {
    //console.log(JSON.stringify(data));
    if(typeof sensors[data.type] == 'undefined') {
        sensors[data.type] = {};
    } 
    for(var attr in data.data) {
        sensors[data.type][attr] = data.data[attr];
    }
    if(data.type == 'key') {
        if(data.data.left) {
            slidePrev();
        } else if(data.data.right) {
            slideNext();
        }
    }

    $('#sensors').html(JSON.stringify(sensors, null, '\t'));
}

function onkd(event) {
    var e = event.keyCode;
    
    switch(e) {
        case 37:
            slidePrev();
            break;
        case 39:
            slideNext();
            break;
        default:
            break;
    }
}

function slidePrev() {
    var now = $('#slides').children(':visible');
    var last = $('#slides').children(':last');
    var prev = now.prev();
    prev = prev.index() == -1 ? last : prev;
    now.fadeOut(100, function() {
        prev.fadeIn(100, 'swing', testSlide);
    });
}

function slideNext() {
    var now = $('#slides').children(':visible');
    var first = $('#slides').children(':first');
    var next = now.next();
    next = now.next();
    next = next.index() == -1 ? first : next;
    now.fadeOut(100, function() {
        next.fadeIn(100, 'swing', testSlide);
    });
}

function testSlide() {
    var now = $('#slides').children(':visible');
    if(now.is($('#processing'))) {
        startProc();
    }
}

var p = null;
function startProc() {
    var canvas = document.getElementById("pc");
    if(!p) {
        p = new Processing(canvas, sketchProc);
    }
}

function sketchProc(pjs) {
    var radius = 50.0;
    var delay = 3;
    var X, Y;
    var nX, nY;
    var size = $(window).height()*0.7;

    pjs.setup = function() {
	    pjs.size(size, size);
	    pjs.strokeWeight(10);
	    pjs.frameRate(15);
        X = pjs.width / 2;
        Y = pjs.height / 2;
        nX = X;
        nY = Y;  
    }

    pjs.draw = function() {
        radius = 50.0 + 15*Math.sin(pjs.frameCount / 4);
        if(typeof sensors.accel == typeof{}) {
            nX = (pjs.width / 2) + (pjs.width * sensors.accel.x) / 4;
            nY = (pjs.height / 2) - (pjs.height * sensors.accel.y) / 4;
        }
        X += (nX-X)/delay;
        Y += (nY-Y)/delay;
        
	    pjs.background(100, 200, 200);
  	    pjs.fill(0, 121, 184);
  	    pjs.stroke(255); 
  	    pjs.ellipse(X, Y, radius, radius); 
    }
    
    pjs.setup();
}