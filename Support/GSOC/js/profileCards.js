/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(initStart);

var idtoDelete;
var allFiles;

function initStart(){
    var username = $.cookie("githubUserName");
                  //"https://api.github.com/users/"+username+"/gists/per_page=100&page=1";
    var gisturl = "https://api.github.com/users/"+username+"/gists?per_page=100&page=1";
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: getAllGist
    };
    var token = $.cookie('githubToken');
     gistrequest.headers = {
        "Authorization": 'token ' + token
     };
     $.ajax(gistrequest).fail(gistfail);
     
     function getAllGist(response){
         allFiles = response;
         init();
     }
     
     
   function init() {
    var idsave =$.cookie('gistSaveId');
    var param= getParameterByName("profileId");
    if (idsave === param){
    $(".bonecard-listDraft").each(function(index) {
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
            var token = $.cookie('githubToken');
            gistrequest.headers = {
                "Authorization": 'token ' + token
            };
            //console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            //console.log('success: ' + JSON.stringify(response));
            var draft = JSON.parse(response.files["autosave.json"].content);
            var ddraft = document.getElementById("tab_draft");
            var draftcontent,draftpaging;
            var counter = 0, counterName=0;
            var arrayNames=[];
            //$.each(newC,function(index,value){
              //  size=size+1;
            //});
            $.each(draft,function(index,value){
            //draft.forEach(function(index) {
                if(value.id !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    if(counter == 0){
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            draftpaging=document.createElement("div");
                            var name="df"+counterName;
                            draftpaging.id=name;
                            counterName=counterName+1;
                            arrayNames.push(name);
                            counter++;
                            draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            draftcontent.className = "bonecardSmall";
                            draftcontent.id=value.id;
                            if(arrayNames.length > 1){
                                //publishcontent.style.display="";
                                draftpaging.setAttribute("style", "display: none;");
                            }
                            draftpaging.appendChild(draftcontent);
                        }
                    }
                    else if(counter == 3){
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            counter = 0;
                            draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            draftcontent.className = "bonecardSmall";
                            draftcontent.id=value.id;
                            draftpaging.appendChild(draftcontent);
                            ddraft.appendChild(draftpaging);
                        }
                    }
                    else{
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            counter++;
                            draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            draftcontent.className = "bonecardSmall";
                            draftcontent.id=value.id;
                            draftpaging.appendChild(draftcontent);
                        }
                    }   
                }
            })
            if(counter !== 0){
                ddraft.appendChild(draftpaging);
            }
            var ulpagination=createPaginationDr(arrayNames);
            ddraft.appendChild(ulpagination);

            $(".bonecardSmall").each(function(index) {
            //draft.forEach(function(index) {
                //console.log('found a bonecard');
                var card = $(this);
                var gistid =card.attr("id");
                if(gistid !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    var gisturl = "https://api.github.com/gists/" + gistid;
                    var gistrequest = {
                        type: "GET",
                        url: gisturl,
                        success: gistsuccess,
                        dataType: "json"
                    };
                    var token = $.cookie('githubToken');
                        gistrequest.headers = {
                        "Authorization": 'token ' + token
                    };
                    //console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    //console.log('success: ' + JSON.stringify(response));
                   // console.log('Response id: '+ response.id);
                    link='<a href="edit.html?gistid='+response.id+'"></a>';
                    var newDiv='<div class="bonecardSmall" id="'+response.id+'"><a class="boxclose" id="boxclose"></a>'+ '<a href="edit.html?gistid='+response.id+'">'+response.files["CARD_Preview.html"].content +'</div></a>';
                    link=link+newDiv;
                    card.replaceWith(newDiv);
                    card.show();
                }
            });
                 
           
            //list.show();
        }
    });
    
    $(".bonecard-listPublish").each(function(index) {
        var list1 = $(this);
        var savingGist = $.cookie('gistSaveId');
        if(savingGist) {
            var gisturl = "https://api.github.com/gists/" + savingGist;
            var gistrequest = {
                type: "GET",
                url: gisturl,
                success: gistsuccess,
                dataType: "json"
            };
            var token = $.cookie('githubToken');
            gistrequest.headers = {
                "Authorization": 'token ' + token
            };
            //console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            //console.log('success: ' + JSON.stringify(response));
            var publish = JSON.parse(response.files["save.json"].content);
            var dpublish = document.getElementById("tab_publish");
            var publishcontent,publishpaging;
            var counter = 0, counterName=0;
            var arrayNames=[];
            $.each(publish,function(index,value){
            //publish.forEach(function(index) {
                if(value.id !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    if(counter == 0){
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            publishpaging=document.createElement("div");
                            var name="pf"+counterName;
                            publishpaging.id=name;
                            counterName=counterName+1;
                            arrayNames.push(name);
                            counter++;
                            publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            publishcontent.className = "bonecardSmallP";
                            publishcontent.id=value.id;
                            if(arrayNames.length > 1){
                                //publishcontent.style.display="";
                                publishpaging.setAttribute("style", "display: none;");
                            }
                            publishpaging.appendChild(publishcontent);
                        }
                    }
                    else if(counter == 3){
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            counter = 0;
                            publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            publishcontent.className = "bonecardSmallP";
                            publishcontent.id=value.id;
                            publishpaging.appendChild(publishcontent);
                            dpublish.appendChild(publishpaging);
                        }
                    }
                    else{
                        var available = _.find(allFiles, { 'id': value.id });
                        if(available !== undefined){
                            counter++;
                            publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                            publishcontent.className = "bonecardSmallP";
                            publishcontent.id=value.id;
                            publishpaging.appendChild(publishcontent);
                        }
                    }   
                }
            })
            if(counter !== 0){
                dpublish.appendChild(publishpaging);
            }
            
            var ulpagination=createPagination(arrayNames);
            dpublish.appendChild(ulpagination);
            
            $(".bonecardSmallP").each(function(index) {
            //draft.forEach(function(index) {
                //console.log('found a bonecard');
                var card = $(this);
                var gistid =card.attr("id");
                if(gistid !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    var gisturl = "https://api.github.com/gists/" + gistid;
                    var gistrequest = {
                        type: "GET",
                        url: gisturl,
                        success: gistsuccess,
                        dataType: "json"
                    };
                    var token = $.cookie('githubToken');
                        gistrequest.headers = {
                        "Authorization": 'token ' + token
                    };
                   // console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    var link="";newDiv="";
                    //console.log('success: ' + JSON.stringify(response));
                    //('Response id: '+ response.id);
                    link='<a href="tutorial.html?gistid='+response.id+'">';
                    newDiv='<div class="bonecardSmallP" id="'+response.id+'"><a class="boxclose" id="boxclose"></a>'+'<a href="'+ 'tutorial.html?gistid='+response.id+'">'+response.files["CARD_Preview.html"].content +'</div></a>';
                    link=link+newDiv;
                    card.replaceWith(newDiv);
                    card.show();
                }
            });
           
           
            list1.show();
        }
    });
    
    function createPagination(names){
        var uiPaging=document.createElement("ul");
        uiPaging.className="pagination pagination-sm";
        uiPaging.id="ulpublish";
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
    
    function createPaginationDr(names){
        var uiPaging=document.createElement("ul");
        uiPaging.id="uldraft";
        uiPaging.className="pagination pagination-sm";
        
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
    
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    
    }
    else{
        var link="publicProfile.html?profileId="+param;
        $(location).attr('href', link);
    }
    
    
}
}




