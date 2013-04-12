var name = "#floatMenu";  
var menuYloc = null;  
  
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
        this.href = 'http://' + window.location.host + ':3000';
    });
    $('.gateone-url').each(function() {
        this.href = 'https://' + window.location.host;
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
        $.get('/static/side-menu.html', function(data){
            $('#side-menu').replaceWith(data);
        });
    }
});

$(document).ready(function(){
    if($('#connect-status').length) {
        var connectState = 'init';
        var statusDisconnected = '' +
            '<div id="connect-status">' +
            '    <div class="browser-connect">' +
            '        <img alt="Not Connected" src="/static/images/usb.png" border="0">' +
            '        <div id="browser-content"><strong>Did you know?</strong>  This page can interact with your BeagleBone<br />' +
            'Type in your BeagleBone&#39;s IP address here:<input id="connect-ip"></input>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        var statusConnected = '' +
            '<div id="connect-status">' +
            '    <div class="browser-connected">' +
            '        <img alt="Connected" src="/static/images/green_check.png" border="0">' +
            '        <div id="browser-content"><strong>Your board is connected!</strong><br>' +
            '            <div id="board-info"></div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        var i = 0;
        var serversToTry = [
            window.location.host,
            '192.168.7.2',
            'beaglebone.local',
            'beaglebone-2.local'
        ];
        $('#connect-status').replaceWith(statusDisconnected);
        testForConnection();

        function testForConnection() {
            var handlers = {};
            handlers.callback = callback;
            handlers.initialized = initialized;
            handlers.connecting = disconnected;
            handlers.connect_failed = disconnected;
            handlers.reconnect_failed = disconnected;
            handlers.disconnect = disconnected;
            handlers.connect = connected;
            handlers.reconnect = connected;
            handlers.reconnecting = connected;
            $('#connect-ip').keypress(oninput);
            setTargetAddress(serversToTry[i], handlers);

            function oninput(e) {
                if(e.which == 10 || e.which == 13) {
                    setTargetAddress($('#connect-ip').val(), handlers);
                }
            }

            function callback() {
                if(typeof _bonescript == 'undefined') {
                    setTimeout(testForConnection, 1000);
                }
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
                    connectState = 'disconnected';
                }
            }
        }
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
        if(typeof _bonescript.address != 'undefined')
            info += ' at ' + _bonescript.address;
        info += '</div>';
        $('#board-info').replaceWith(info);
    });
}
