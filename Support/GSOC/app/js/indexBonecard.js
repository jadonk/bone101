/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(init);

function init() {
   /* $(".container").each(function(index) {
        var list = $(this);
        var gistid = "25aec40876dfb11f8d36"
        if(gistid) {
            var gisturl = "https://api.github.com/gists/" + gistid;
            var gistrequest = {
                type: "GET",
                url: gisturl,
                success: gistsuccess,
                dataType: "json"
            };
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            console.log('success: ' + JSON.stringify(response));
            list.replaceWith(response.files["Sitelist.html"].content);
            $(".bonecard").each(function(index) {
                console.log('found a bonecard');
                var card = $(this);
                var gistid = card.attr("gistid");
                if(gistid) {
                    var gisturl = "https://api.github.com/gists/" + gistid;
                    var gistrequest = {
                        type: "GET",
                        url: gisturl,
                        success: gistsuccess,
                        dataType: "json"
                    };
                    console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    console.log('success: ' + JSON.stringify(response));
                    
                    card.replaceWith('<a href="tutorial?gistid='+response.id+'><div class="bonecard">\n'+ response.files["cover.html"].content +'\n></div></a>');
                    card.show();
                }
            });
            $('.bonecard').css("cursor", "pointer");       
            $('.bonecard').click(function() {
                // TODO: This isn't the right way to zoom, just a placeholder
                // URL needs to be replaced
                $(this).toggleClass('bonecard-zoomed');
            });
            list.show();
        }
    });
    
    ;*/
}



