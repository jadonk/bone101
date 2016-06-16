serverBasePath = typeof serverBasePath == 'undefined' ? '/bone101/' : serverBasePath;
var name = "#floatMenu";  
var menuYloc = null;
var connectState = 'init';
var statusDisconnected = '' +
    '<div id="connect-status">' +
    '    <div class="browser-connect">' +
    '        <img alt="Not Connected" src="' + serverBasePath + 'static/images/usb.png" border="0">' +
    '        <div id="browser-content"><strong>Did you know?</strong>  This page can interact with your BeagleBone<br />' +
    'Type in your BeagleBone&#39;s IP address here: <input id="connect-ip"></input>' +
    '        </div>' +
    '    </div>' +
    '</div>';
var ace_editor_id = -1;
var statusConnected = '' +
    '<div id="connect-status">' +
    '    <div class="browser-connected">' +
    '        <img alt="Connected" src="' + serverBasePath + 'static/images/green_check.png" border="0">' +
    '        <div id="browser-content"><strong>Your board is connected!</strong><br>' +
    '            <div id="board-info"></div> <button onclick="run(ace_editor_id);">Run</button>' +
    '            <button onclick="disconnect();">Disconnect</button>' +
    '        </div>' +
    '    </div>' +
    '</div>';
var handlers = {};
function oninput(e) {
    if(e.which == 10 || e.which == 13) {
        var givenAddress = $('#connect-ip').val();
        setTargetAddress(givenAddress, handlers);
    }
}

function disconnect() {
    console.log('Bonescript: disconnected');
    $('#connect-status').replaceWith(statusDisconnected);
    $('#connect-ip').keypress(oninput);
    connectState = 'disconnected';
}
  
$(document).ready(function(){
    if($(name).length) {
        menuYloc = parseInt($(name).css("top").substring(0,$(name).css("top").indexOf("px")));
        $(window).scroll(function () {
            var offset = menuYloc+$(document).scrollTop()+"px";
            $(name).animate({top:offset},{duration:500,queue:false});
        });
    }
});  

$(document).ready(function(){
    $('.cloud9-url').each(function() {
        this.href = 'http://192.168.7.2:3000';
    });
});

$(function() {
    if($('#accordian').length) {
        $("#accordion").accordion({
            collapsible: true
        });
    }
});

$(document).ready(function(){
    if($('#side-menu').length) {
        $.get(serverBasePath + 'Support/BoneScript/menu/', function(data){
            $('#side-menu').replaceWith(data);
        });
    }

    $.get(serverBasePath + 'Support/BoneScript/menu/', function(data){
        $('#dropdown-main-menu').children().replaceWith($(data).html());
    });

});

$(document).ready(function(){
    if($('#connect-status').length) {
        $('#connect-status').replaceWith(statusDisconnected);
        $('#connect-ip').keypress(oninput);

	// note, due to a bug in Firefox, the call is moved below

        function testForConnection() {
            handlers.callback = callback;
            handlers.initialized = initialized;
            handlers.connecting = disconnected;
            handlers.connect_failed = connect_failed;
            handlers.reconnect_failed = disconnected;
            handlers.disconnect = disconnected;
            handlers.connect = connected;
            handlers.reconnect = connected;
            handlers.reconnecting = connected;
            
            setTimeout(tryWindowHost, 5);
            setTimeout(try192, 5);
            setTimeout(tryLocal, 5);
            
            function tryWindowHost() {
                setTargetAddress(window.location.host, handlers);
            }
            function try192() {
                setTargetAddress('192.168.7.2', handlers);
            }
            function tryLocal() {
                setTargetAddress('beaglebone.local', handlers);
            }

            function callback() {
            }
            
            function connected() {
                if(connectState == 'disconnected') {
                    console.log('Bonescript: connected');
                    connectState = 'reconnecting';
                }
            }
            function initialized() {
                console.log('Bonescript: initialized');
                $('#connect-status').replaceWith(statusConnected);
                updateBoardInfo();
                if(typeof onbonescriptinit == 'function') onbonescriptinit();
                connectState = 'connected';
            }
            function disconnected() {
                if(connectState == 'connected') {
                    console.log('Bonescript: disconnected');
                    $('#connect-status').replaceWith(statusDisconnected);
                    $('#connect-ip').keypress(oninput);
                    connectState = 'disconnected';
                }
            }
            function connect_failed() {
                if(connectState == 'init') {
                    _onSocketIOLoaded_workaround();
                } else {
                    disconnected();
                }
            }
        }

        testForConnection();
    }
});

function updateBoardInfo() {
    var b = require('bonescript');
    b.getPlatform(function(x) {
        var info = '<div id="board-info">' + x.name;
        if(typeof x.version != 'undefined')
            info += ' rev ' + x.version;
        if(typeof x.serialNumber != 'undefined')
            info += ' S/N ' + x.serialNumber;
        if(typeof x.bonescript != 'undefined')
            info += ' running BoneScript ' + x.bonescript;
        if(typeof _bonescript.address != 'undefined')
            info += ' at ' + _bonescript.address;
        info += '</div>';
        $('#board-info').replaceWith(info);
    });

    var boardClass = "beagleboneblack";
    b.readTextFile('/proc/device-tree/model', onReadModel);

    function onReadModel(model) {
        if(model.data.indexOf("TI AM335x BeagleBone Green Wireless") == 0) {
            boardClass = "beaglebonegreenwireless";
        } else if(model.data.indexOf("TI AM335x BeagleBone Green") == 0) {
            boardClass = "beaglebonegreen";
        }
        $("div.perboard").each(doHide);
        $("div." + boardClass).each(doShow);
    }

    function doHide(e) {
        if(! $(this).hasClass(boardClass)) {
            $(this).css("display", "none");
        }
    }

    function doShow(e) {
        $(this).css("display", "inline");
    }
}

function _onSocketIOLoaded_workaround() {
    //console.log("socket.io loaded");
    var socket_addr = 'http://' + _bonescript.address + ':80';
    var socket = io.connect(socket_addr);
    socket.on('require', getRequireData);
    socket.on('bonescript', _seqcall);
    socket.on('connect', _bonescript.on.connect);
    socket.on('connecting', _bonescript.on.connecting);
    socket.on('disconnect', _bonescript.on.disconnect);
    socket.on('connect_failed', _bonescript.on.connect_failed);
    socket.on('error', _bonescript.on.error);
    socket.on('reconnect', _bonescript.on.reconnect);
    socket.on('reconnect_failed', _bonescript.on.reconnect_failed);
    socket.on('reconnecting', _bonescript.on.reconnecting);
    socket.on('initialized', _bonescript.on.initialized);

    function getRequireData(m) {
        if(!m.module || !m.data)
            throw('Invalid "require" message sent for "' + m.module + '"');
        //console.log('Initialized module: ' + m.module);
        _bonescript.modules[m.module] = {};
        for(var x in m.data) {
            if(!m.data[x].type || !m.data[x].name || (typeof m.data[x].value == 'undefined'))
                throw('Invalid data in "require" message sent for "' + m.module + '.' + m.data[x] + '"');
            if(m.data[x].type == 'function') {
                // define the function
                if(!m.data[x].value)
                    throw('Missing args in "require" message sent for "' + m.module + '.' + m.data[x] + '"');
                var myargs = m.data[x].value;

                // eval of objString builds the call data out of arguments passed in
                var objString = '';
                for(var y in myargs) {
                    if(isNaN(y)) continue;  // Need to find the source of this bug
                    if(myargs[y] == 'callback') continue;
                    objString += ' if(typeof ' + myargs[y] + ' == "function") {\n';
                    objString += '  ' + myargs[y] + ' = ' + myargs[y] + '.toString();\n';
                    objString += ' }\n';
                    objString += ' calldata.' + myargs[y] + ' = ' + myargs[y] + ';\n';
                }
                var argsString = myargs.join(', ');
                var handyfunc = '_bonescript.modules["' + m.module + '"].' + m.data[x].name +
                    ' = ' +
                    'function (' + argsString + ') {\n' +
                    ' var calldata = {};\n' +
                    objString +
                    ' if(callback) {\n' +
                    '  _bonescript._callbacks[_bonescript._seqnum] = callback;\n' +
                    '  calldata.seq = _bonescript._seqnum;\n' +
                    '  _bonescript._seqnum++;\n' +
                    ' }\n' +
                    ' socket.emit("' + m.module + '$' + m.data[x].name + '", calldata);\n' +
                    '};\n';
                eval(handyfunc);
            } else {
                _bonescript.modules[m.module][m.data[x].name] = m.data[x].value;
            }
        }

        // Work-around to add shell command
        _bonescript.modules[m.module]["socket"] = socket;
        _bonescript.modules[m.module]["shell"] = function(command) {
            socket.emit('shell', command);
        }
        
	// Call-back initialized function
	_bonescript.on.initialized();
    }
}
