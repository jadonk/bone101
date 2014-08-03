var address = window.location.host;
var port = 5001;
var connected = false;
var socketLoadTimeout = false;
var handlers = {initialized: run, timeout: noBoneScript};
setTargetAddress(address, handlers);

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

function onSocketIOLoad(script, textStatus) {
    connected = false;
    if(socketLoadTimeout) clearTimeout(socketLoadTimeout);
    console.log("Load status: " + textStatus);
    socket = new io.connect('http://' + address + ':' + port);
    socket.on('data', onData);
}

function onData(data) {
    console.log(JSON.stringify(data));
}