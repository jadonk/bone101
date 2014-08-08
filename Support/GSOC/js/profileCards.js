/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(init);
var idtoDelete;
function init() {
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
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            console.log('success: ' + JSON.stringify(response));
            var draft = JSON.parse(response.files["autosave.json"].content);
            var ddraft = document.getElementById("tab_draft");
            var draftcontent,draftpaging;
            var counter = 0, counterName=0;
            var arrayNames=[];
            draft.forEach(function(index) {
                if(index.id !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    if(counter == 0){
                        draftpaging=document.createElement("div");
                        var name="df"+counterName;
                        draftpaging.id=name;
                        counterName=counterName+1;
                        arrayNames.push(name);
                        counter++;
                        draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        draftcontent.className = "bonecardSmall";
                        draftcontent.id=index.id;
                        if(arrayNames.length > 1){
                            //publishcontent.style.display="";
                            draftpaging.setAttribute("style", "display: none;");
                        }
                        draftpaging.appendChild(draftcontent);
                    }
                    else if(counter == 3){
                        counter = 0;
                        draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        draftcontent.className = "bonecardSmall";
                        draftcontent.id=index.id;
                        draftpaging.appendChild(draftcontent);
                        ddraft.appendChild(draftpaging);
                    }
                    else{
                        counter++;
                        draftcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        draftcontent.className = "bonecardSmall";
                        draftcontent.id=index.id;
                        draftpaging.appendChild(draftcontent);
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
                console.log('found a bonecard');
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
                    console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    console.log('success: ' + JSON.stringify(response));
                    console.log('Response id: '+ response.id);
                    link='<a href="tutorial.html?gistid='+response.id+'">';
                    newDiv='<div class="bonecardSmall" id="'+response.id+'"><a class="boxclose" id="boxclose"></a>'+ response.files["CARD_Preview.html"].content +'</div></a>';
                    link=link+newDiv;
                    card.replaceWith(link);
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
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            console.log('success: ' + JSON.stringify(response));
            var publish = JSON.parse(response.files["save.json"].content);
            var dpublish = document.getElementById("tab_publish");
            var publishcontent,publishpaging;
            var counter = 0, counterName=0;
            var arrayNames=[];
            publish.forEach(function(index) {
                if(index.id !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    if(counter == 0){
                        publishpaging=document.createElement("div");
                        var name="pf"+counterName;
                        publishpaging.id=name;
                        counterName=counterName+1;
                        arrayNames.push(name);
                        counter++;
                        publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        publishcontent.className = "bonecardSmallP";
                        publishcontent.id=index.id;
                        if(arrayNames.length > 1){
                            //publishcontent.style.display="";
                            publishpaging.setAttribute("style", "display: none;");
                        }
                        publishpaging.appendChild(publishcontent);
                    }
                    else if(counter == 3){
                        counter = 0;
                        publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        publishcontent.className = "bonecardSmallP";
                        publishcontent.id=index.id;
                        publishpaging.appendChild(publishcontent);
                        dpublish.appendChild(publishpaging);
                    }
                    else{
                        counter++;
                        publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        publishcontent.className = "bonecardSmallP";
                        publishcontent.id=index.id;
                        publishpaging.appendChild(publishcontent);
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
                console.log('found a bonecard');
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
                    console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    link="",newDiv="";
                    console.log('success: ' + JSON.stringify(response));
                    console.log('Response id: '+ response.id);
                    link='<a href="tutorial.html?gistid='+response.id+'">';
                    newDiv='<div class="bonecardSmallP" id="'+response.id+'"><a class="boxclose" id="boxclose"></a>'+ response.files["CARD_Preview.html"].content +'</div></a>';
                    link=link+newDiv;
                    card.replaceWith(link);
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
}

function getSavingGist(){
    var savingGist = $.cookie('gistSaveId');
    if(savingGist) {
        var gisturl = "https://api.github.com/gists/" + savingGist;
        var gistrequest = {
            type: "GET",
            url: gisturl,
            success: createNewSavingFile,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        gistrequest.headers = {
            "Authorization": 'token ' + token
        };
        console.log('request: ' + JSON.stringify(gistrequest));
        $.ajax(gistrequest).fail(gistfail);
    }
}

function createNewSavingFile(response){
    var jsonSave = JSON.parse(response.files["save.json"].content);
    var jsonAutosave = JSON.parse(response.files["autosave.json"].content);
    var savingGist = idtoDelete;
    jsonAutosave = _.omit(jsonAutosave, savingGist);
    jsonSave = _.omit(jsonSave, savingGist);
    var files = {
            "description": "BONELIST",
            "public": true,
            "files": {
                "autosave.json": {
                    "content": JSON.stringify(jsonAutosave)
                },
                "save.json": {
                    "content": JSON.stringify(jsonSave)
                }
            }
        };
    var savingGist = $.cookie('gistSaveId');   
    var gisturl = "https://api.github.com/gists/" + savingGist;
    var gistupdate = {
           type: "PATCH",
           url: gisturl,
           data: JSON.stringify(files), //JSON.stringify(Jfile),
           success: updategistSaving,
           dataType: "json"
       };
    
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };   
        console.log('request: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(gistfail);
}

function updategistSaving(response){
    init();
}


