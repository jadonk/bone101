$(document).ready(init);

function init() {
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    
    if(location.hash) {
        console.log(location.hash);
        var gistid = location.hash.substring(1);
        $(".bonecard-list").each(function(index) {
            var list = $(this);
            console.log("Replacing gistid " + list.attr("gistid") +
                        "with " + gistid);
            list.attr("gistid", gistid);
        });
    }
    
    
    
    $(".bonecard-list").each(function(index) {
        var gistid = getParameterByName('gistid');
        
        //var list = $(this);
        //var gistid = list.attr("gistid");
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
        
        function getFileCardsNames(obj){
            objFiles = [];
            $.each(obj, function(key, value) {
                var str = obj[key].filename;
                if (str.indexOf("CARD_") >= 0){
                    objFiles.push(obj[key].filename);
                }
            });
            return objFiles;
        }
        
        function getFileCards(obj){
            objFiles = [];
            $.each(obj, function(key, value) {
                var str = obj[key].filename;
                if (str.indexOf("CARD_") >= 0){
                    objFiles.push(obj[key]);
                }
            });
            return objFiles;
        }
        
        function addCards(objFiles){
            $("#cardList");
            len=100/objFiles.length;
            mult=100*objFiles.length;
            $(".box").css({"height":"100%","float":"left","width":len+"%"});
            //$('.box').css({"width":len+"%"});
            $(".bonecard-list").css({"height":"100%","float":"left","width":mult+"%"});
            
            var x= $('indexCards');
            var xx = $(indexCards);
            for(i=0;i<objFiles.length;i++){
                $("#cardList").append('<li class="box" id='+i+'><div class="bonecard"></div></li>');
                //name=objFiles[i].filename;
                $('#indexCards').append('<li><a href="#'+i+'">Card '+(i+1)+'</a></li>');
            }
            
        }
        
        function replaceCards(objFiles,cardNames){
            var list= $("#cardList").find("li");
            for(i=0;i<list.length;i++){
                list[i].innerHTML='<div class="bonecard">'+objFiles[cardNames[i]].content+'</div>'
            }
        }
        
        function gistsuccess(response) {
            console.log('success: ' + JSON.stringify(response));
            obj = response.files;
            var objFiles = getFileCards(obj);
            var cardNames = getFileCardsNames(obj);
            //list.replaceWith(response.files["list.html"].content);
            addCards(objFiles);
            replaceCards(response.files,cardNames);
            /*$(".bonecard").each(function(index) {
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
                    card.replaceWith('<div class="bonecard">\n' +
                        response.files["cover.html"].content +
                        '\n</div>'
                    );
                    card.show();
                }
            });*/
            $('.bonecard').css("cursor", "pointer");       
            $('.bonecard').click(function() {
                // TODO: This isn't the right way to zoom, just a placeholder
                // URL needs to be replaced
                $(this).toggleClass('bonecard-zoomed');
            });
            //list.show();
        }
    });
    
   
};