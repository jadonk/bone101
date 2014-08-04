/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(init);

function init() {
    $(".bonecard-listPublish").each(function(index) {
        var list = $(this);
        var savingGist = $.cookie('gistSaveId');
        if(savingGist) {
            var gisturl = "https://api.github.com/gists/" + savingGist;
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
            var draft = JSON.parse(response.files["autosave.json"].content);
            var publish = JSON.parse(response.files["save.json"].content);
            
            draft.forEach(function(index) {
                console.log('found a bonecard');
                //var card = $(this);
                var gistid =index.id;
                if(gistid !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
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
                    console.log('Response id: '+ response.id);
                    link='<a href="tutorial.html?gistid='+response.id+'">';
                    newDiv='<div class="bonecard">'+ response.files["CARD_Preview.html"].content +'</div></a>';
                    link=link+newDiv;
                    card.replaceWith(link);
                    card.show();
                }
            });
            $('.bonecard').css("cursor", "pointer");       
            $('.bonecard').click(function() {

                $(this).toggleClass('bonecard-zoomed');
            });
            list.show();
        }
    });
    
    
}



