    /* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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
        $.ajax(gistrequest).fail(errorNewSavingFile);
    }
}

function errorNewSavingFile(response){
    console.log('fail: ' + JSON.stringify(response));
}

function createNewSavingFile(response){
    var jsonSave = JSON.parse(response.files["save.json"].content);
    var jsonAutosave = JSON.parse(response.files["autosave.json"].content);
    var sizeSave=0;
    $.each(jsonSave,function(index,value){
        sizeSave=sizeSave+1;
    });
    
    var sizeAuto=0;
    $.each(jsonAutosave,function(index,value){
        sizeAuto=sizeAuto+1;
    });
    var savingGist = idtoDelete;
    jsonAutosave = deleteRecordByFileName(jsonAutosave, savingGist,sizeAuto);
    jsonSave = deleteRecordByFileName(jsonSave, savingGist,sizeSave);
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
        $.ajax(gistupdate).fail(errorNewSavingFile);
}

function updategistSaving(response){
    var id = $.cookie("gistSaveId");
    var link1="profile.html?profileId="+id;
    window.location.replace(link1);
    //$(location).attr('href', link1);
    
}

function deleteRecordByFileName (myArr, fileName,size) {
    var index = null;
    var a=0;
    for (var i =0; i < size; i++) {
        if (myArr[i].id === fileName) {
            index = i;
            break;
        }   
    }
    if(index !==null){
        var newArr={};
        for (var i =0; i < size; i++) {
            if(index !== i){
                newArr[a]=myArr[i];
                a++;
            }   
        }

        return newArr;
    }
    else{
        return myArr;
    }
};

function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function getpublicProfile() {
    $(".bonecard-listPublish").each(function(index) {
        var list1 = $(this);
        var gistid = getParameterByName("profileId");
        if(gistid) {
            var gisturl = "https://api.github.com/gists/" + gistid;
            var gistrequest = {
                type: "GET",
                url: gisturl,
                success: gistsuccessProfile,
                dataType: "json"
            };
           
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfailProfile);
        }

        function gistfailProfile(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function createPaginationPublic(names){
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
        
        function gistsuccessProfile(response) {
            console.log('success: ' + JSON.stringify(response));
            var publish = JSON.parse(response.files["save.json"].content);
            var dpublish = document.getElementById("tab_publish");
            var publishcontent,publishpaging;
            var counter = 0, counterName=0;
            var arrayNames=[];
            $.each(publish,function(index,value){
            //publish.forEach(function(index) {
                if(value.id !== "THISISTHEFIRSTIDYOUWOULDNTUSE") {
                    if(counter == 0){
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
                    else if(counter == 5){
                        counter = 0;
                        publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        publishcontent.className = "bonecardSmallP";
                        publishcontent.id=value.id;
                        publishpaging.appendChild(publishcontent);
                        dpublish.appendChild(publishpaging);
                    }
                    else{
                        counter++;
                        publishcontent=document.createElement("div");//"<div class='bonecardSmall'></div>";
                        publishcontent.className = "bonecardSmallP";
                        publishcontent.id=value.id;
                        publishpaging.appendChild(publishcontent);
                    }   
                }
            })
            if(counter !== 0){
                dpublish.appendChild(publishpaging);
            }
            
            var ulpagination=createPaginationPublic(arrayNames);
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
                        success: gistsuccessProSuc,
                        dataType: "json"
                    };
                    
                   // console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfailProSuc);
                }        
                
                function gistfailProSuc(response){
                    console.log('fail: ' + JSON.stringify(response));
                }
                
                function gistsuccessProSuc(response) {
                    var links="";var newDiv="";
                    console.log('success: ' + JSON.stringify(response));
                    console.log('Response id: '+ response.id);
                    links='<a href="tutorial.html?gistid='+response.id+'">';
                    newDiv='<div class="bonecardSmallP" id="'+response.id+'"><div class="boxclose" id="boxclose"></div>'+ response.files["CARD_Preview.html"].content +'</div></a>';
                    links=links+newDiv;
                    card.replaceWith(links);
                    card.show();
                }
            });
           
           
            list1.show();
            
        }
    });

}