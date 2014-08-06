$(document).ready(init);

function init() {
    $(function(){
        $('#indexCards').on("click", "li a", function(){       
            $('.active').removeClass('active');
            $(this).closest('li').addClass('active');
            var text = $(this).text();
            $('#selectCard').html(text+'<b class="caret"></b>');
        });
    });
    
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    
    if(location.hash) {
        //console.log(location.hash);
        var gistid = location.hash.substring(1);
        $(".bonecard-list").each(function(index) {
            var list = $(this);
            //console.log("Replacing gistid " + list.attr("gistid") +
                   //     "with " + gistid);
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
            //console.log('request: ' + JSON.stringify(gistrequest));
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
        
        function getListFileName(obj){
            var file=""
            $.each(obj, function(key, value) {
                var str = obj[key].filename;
                if (str == "CardList.html"){
                    //objFiles.push(obj[key]);
                    file = obj[key].content.replace(/\n/g, ",").slice(0,-1);
                }
            });
            file=file.split(",");
            return file;
        }
        
        function addCards(list){
            $("#cardList");
            var x= $('indexCards');
            var xx = $(indexCards);
            for(i=1;i<list.length;i++){
                $("#cardList").append('<li class="box" id='+i+'><div class="bonecard"></div></li>');
                if(i == 1){
                    $('#indexCards').append('<li class="active"><a href="#'+i+'">'+list[i]+'</a></li>');
                    $('#selectCard').html(list[i]+'<b class="caret"></b>');
                }else{
                    $('#indexCards').append('<li><a href="#'+i+'">'+list[i]+'</a></li>');
                }
            }
            
        }
        
        function replaceCards(objFiles,cardNames,cards){
            var list= $("#cardList").find("li");
            for(i=0;i<list.length;i++){
                if(cardNames[i] != "CARD_Preview.html"){
                    if(cardNames[i].indexOf(".js") > 0){
                        var editorS="editor"+i;
                        var editorB="button"+i;
                        list[i].innerHTML='<div class="bonecard"><button type="button" id=' + editorB + ' class="btn btn-primary">Run</button><div class="editor" id='+editorS+'></div></div>';
                        var editor = ace.edit(editorS);
                        editor.setTheme("ace/theme/monokai");
                        editor.getSession().setMode("ace/mode/javascript");
                        editor.getSession().setValue(objFiles[cardNames[i]].content);
                    }
                    else if(cardNames[i].indexOf(".py") > 0){
                        var editorS="editor"+i;
                        list[i].innerHTML='<div class="bonecard"><div class="editor" id='+editorS+'></div></div>';
                        var editor = ace.edit(editorS);
                        editor.setTheme("ace/theme/monokai");
                        editor.getSession().setMode("ace/mode/python");
                        editor.setReadOnly(true);
                        editor.getSession().setValue(objFiles[cardNames[i]].content);
                    }
                    else if(cardNames[i].indexOf(".rb") > 0){
                        var editorS="editor"+i;
                        list[i].innerHTML='<div class="bonecard"><div id='+editorS+'></div></div>';
                        var editor = ace.edit(editorS);
                        editor.setTheme("ace/theme/monokai");
                        editor.getSession().setMode("ace/mode/ruby");
                        editor.setReadOnly(true);
                        editor.getSession().setValue(objFiles[cardNames[i]].content);
                    }
                    else if(cardNames[i].indexOf(".java") > 0){
                        var editorS="editor"+i;
                        list[i].innerHTML='<div class="bonecard"><div id='+editorS+'></div></div>';
                        var editor = ace.edit(editorS);
                        editor.setTheme("ace/theme/monokai");
                        editor.getSession().setMode("ace/mode/java");
                        editor.setReadOnly(true);
                        editor.getSession().setValue(objFiles[cardNames[i]].content);
                    }
                    else{
                        list[i].innerHTML='<div class="bonecard">'+objFiles[cardNames[i]].content+'</div>'
                    }

                }
            }
            len=100/list.length;
            mult=100*list.length;
              $(".box").css({"height":"100%","float":"left","width":len+"%"});
            //$('.box').css({"width":len+"%"});
            $(".bonecard-list").css({"height":"100%","float":"left","width":mult+"%"});
        }
        
        function gistsuccess(response) {
            //console.log('success: ' + JSON.stringify(response));
            obj = response.files;
            var objFiles = getFileCards(obj);
            var cardNames = getFileCardsNames(obj);
            var list = getListFileName(obj);
            //list.replaceWith(response.files["list.html"].content);
            addCards(list);
            replaceCards(response.files,cardNames,list);
            
            $('.bonecard').css("cursor", "pointer");       
            $('.bonecard').click(function() {
                // TODO: This isn't the right way to zoom, just a placeholder
                // URL needs to be replaced
                $(this).toggleClass('bonecard-zoomed');
            });
           
        }
    });
    
   
};