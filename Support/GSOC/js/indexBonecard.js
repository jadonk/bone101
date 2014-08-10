/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(init);

function init() {
    $(".bonecard-list").each(function(index) {
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
                    //var token = $.cookie('githubToken');
                    //gistrequest.headers = {
                      //  "Authorization": 'token ' + token
                    //};
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
            getPaging();
        }
    });
    
    
    function getPaging(){
        var con=document.getElementById("c1");
        var size=con.children.length;
        var amount=Math.ceil(size/6);
        var arrayNames=[];
        var arryDiv=[];
        for(var i =0; i<amount;i++){
            var div1=document.createElement("div");
            var name="Pg"+i;
            div1.id=name;
            arrayNames.push(name);
            arryDiv.push(div1);
        }
        var x=0;
        for(var i=0;i<arryDiv.length;i++){
            for(var j = 0; j< size;j++){
                if(con.children.length >0 ){
                    if(j>0){
                        if (j%6 == 0){
                            break;
                        }
                        else{
                            $(con.children[x]).appendTo($(arryDiv[i]));
                            x=x-1;
                        }
                    }
                    else{
                        $(con.children[x]).appendTo($(arryDiv[i]));
                        x=x-1;
                    }
                }
                x=x+1;
            }
            size=con.children.length;
        }
        
        for(var i=0;i<arryDiv.length;i++){
            if(i>=1){
               arryDiv[i].setAttribute("style", "display: none;"); 
            }
            $(arryDiv[i]).appendTo($(con));
        }
        
        var paging=createPagination(arrayNames);
        $(paging).appendTo($(con));
    }
    
     function createPagination(names){
        var uiPaging=document.createElement("ul");
        uiPaging.className="pagination pagination-sm";
        uiPaging.id="ulindex";
        var liPaging=document.createElement("li");
        var aPaging=document.createElement("a");
        aPaging.innerHTML="&laquo;";
        aPaging.href="#"+names[0];
        liPaging.appendChild(aPaging);
        uiPaging.appendChild(liPaging);
        
        for(i=0;i<names.length;i++){
            var liPaging=document.createElement("li");
            if(i==0){
                liPaging.className="active";
            }
            var aPaging=document.createElement("a");
            aPaging.innerHTML=i+1;
            aPaging.href="#"+names[i];
            liPaging.appendChild(aPaging);
            uiPaging.appendChild(liPaging);
        }
        var liPaging=document.createElement("li");
        var aPaging=document.createElement("a");
        aPaging.innerHTML="&raquo;";
        aPaging.href="#"+names[names.length-1];
        liPaging.appendChild(aPaging);
        uiPaging.appendChild(liPaging);
        
        var centerdiv=document.createElement("div");
        centerdiv.className="text-center";
        centerdiv.appendChild(uiPaging);
        return centerdiv;
        
    } 
}



