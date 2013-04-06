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
        $.get('/static/connect-status.html', function(data){
            $('#connect-status').replaceWith(data);
        });

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
        testForConnection();
        function testForConnection() {
            var handlers = {};
            handlers.callback = callback;
            handlers.initialized = initialized;
            handlers.connecting = disconnected;
            handlers.connect_failed = disconnected;
            handlers.reconnect_failed = disconnected;
            handlers.connect = connected;
            handlers.reconnect = connected;
            handlers.reconnecting = connected;
            setTargetAddress(serversToTry[i], handlers);
            function callback() {
                if(typeof _bonescript == 'undefined') {
                    setTimeout(testForConnection, 1000);
                }
            }
            function connected() {
            }
            function initialized() {
                $('#connect-status').replaceWith(statusConnected);
                updateBoardInfo();
            }
            function disconnected() {
                $.get('/static/connect-status.html', function(data){
                    $('#connect-status').replaceWith(data);
                });
            }
        }
    }
});

function updateBoardInfo() {
    var b = require('bonescript');
    b.getPlatform(function(x) {
        var info = '<div id="board-info">' + x.name;
        if(typeof x.revision != 'undefined')
            info += ' rev ' + x.version;
        if(typeof x.serialNumber != 'undefined')
            info += ' S/N ' + x.serialNumber;
        if(typeof _bonescript.address != 'undefined')
            info += ' at ' + _bonescript.address;
        info += '</div>';
        $('#board-info').replaceWith(info);
    });
}
