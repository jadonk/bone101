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

        var connected = '' +
            '<div id="connect-status">' +
            '    <div class="browser-connected">' +
            '        <img alt="Connected" src="/static/images/green_check.png" border="0">' +
            '        <div id="browser-content"><strong>Your board is connected!</strong><br>' +
            '            Detected:  BeagleBoard Version 1.0Download ISO' +
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
            setTargetAddress(serversToTry[i], function () {
                if(typeof _bonescript != 'undefined') {
                    $('#connect-status').replaceWith(connected);
                } else {
                    setTimeout(testForConnection, 1000);
                }
            });
        }
    }
});
