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
    }
});

// <div class="browser-connected">
// <img alt="Connected" src="/static/images/green_check.png" border="0">
// <div id="browser-content"><strong>Your board is connected!</strong><br>
//Detected:  BeagleBoard Version 1.0Download ISO
// </div>
//</div>
