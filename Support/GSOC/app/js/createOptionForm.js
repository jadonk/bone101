/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function deleteUi(list,listActive,arrayList,editor){
    sizeList = list.find("li").size();
    if(sizeList > 1){
        var id=listActive.attr("id");
        var text=listActive.text();
        var numId=parseInt(id)-1;
        $("li:has('a'):contains("+text+")").remove();
        arrayList.splice(numId,1)
        $('.summernote').eq(editor).code(arrayList[0]);
        sizeList = list.find("li").size();
        for(i=0;i<sizeList;i++){
            x=i+1;
            if (i == 0){
                list[0].children[i].outerHTML='<li class="active" id='+x+'><a href="#">Card '+x+'</a></li>';
            }
            else{
                list[0].children[i].outerHTML='<li class="" id='+x+'><a href="#">Card '+x+'</a></li>';
            }
        }
       
    }
}


function addNewElement(list,listActive,arrayList,editor){
    var Psize= list.find('li');
    listActive.removeClass('active')
    Psize = Psize.size()+1;
    list.append('<li class="active" id='+Psize+'><a href="#">Page '+Psize+'</a></li>');
    var Prevalue= $('.summernote').eq(editor).code();
    arrayList.push(Prevalue);
    $('.summernote').eq(editor).code("");
}
            
function changeElement(ids,listActive,arrayList,editor,allThis){
    var numids=parseInt(ids);
    var Prevalue= $('.summernote').eq(editor).code();
    var id=listActive.attr("id");
    var numId=parseInt(id);
    arrayList[numId-1]=Prevalue;
    listActive.removeClass('active')
    allThis.addClass('active');
    $('.summernote').eq(editor).code(arrayList[numids-1])    
}           
            
function checkTab(list,arrayList,editor){
    var Prevalue= $('.summernote').eq(editor).code();
    if(Prevalue.length > 11){
        var Psize= list.find('li');
        Psize = Psize.size();
        if(arrayList.length <  Psize){
            arrayList.push(Prevalue);
        }
    }
} 



var create_Json = function createJson(pagesPreReq,pagesHDReq){
    var tabOne=$('.summernote').eq(0).code();
    var tabCode=four= $('.summernote').eq(3).code();
    var tabAdditional = $('.summernote').eq(4).code();
    
    cardName=$("#myTab li");
    name="CARD_1_"+cardName[0].innerText.replace(/\r?\n|\r/g,'')+"_1.html";
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {
            
            }};
              
    Jfile["files"][name]={"content": tabOne};            
    obj={};            
    for(i=0;i<pagesPreReq.length;i++){
        name="CARD_2_"+cardName[1].innerText.replace(/\r?\n|\r/g,'')+"_"+(i+1)+".html";
        obj={"content": pagesPreReq[i]};
        Jfile["files"][name]=obj;
    }
    for(i=0;i<pagesHDReq.length;i++){
        name="CARD_3_"+cardName[2].innerText.replace(/\r?\n|\r/g,'')+"_"+(i+1)+".html";
        obj={"content": pagesHDReq[i]};
        Jfile["files"][name]=obj;
    }
    
    if(tabCode.length > 11){
        obj={"content": tabCode};
        Jfile["files"]["CARD_4_"+cardName[3].innerText.replace(/\r?\n|\r/g,'')+"_1.html"]=obj;
    }
    
    if(tabAdditional.length > 11){
        obj={"content": tabAdditional};
        Jfile["files"]["CARD_5_"+cardName[4].innerText.replace(/\r?\n|\r/g,'')+"_1.html"]=obj;
    }
    
    list=cardName[0].innerText.replace(/\r?\n|\r/g,'')+"\n"+cardName[1].innerText.replace(/\r?\n|\r/g,'')+"\n"+cardName[2].innerText.replace(/\r?\n|\r/g,'')+"\n"+cardName[3].innerText.replace(/\r?\n|\r/g,'')+"\n"+cardName[4].innerText.replace(/\r?\n|\r/g,'')
     obj={"content": list};
     Jfile["files"]["names.html"]=obj;
     //return JSON.stringify(Jfile);
    return Jfile;
}

function onsuccess(response) {
    console.log('success: ' + JSON.stringify(response));
    id= response.id;
    $.cookie('gistId', id,{ expires: 1, path: '/' });
    
    var gisturl = "https://api.github.com/gists/" + "25aec40876dfb11f8d36";
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistsuccess,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
}

function onsuccessAuto(response) {
    console.log('success: ' + JSON.stringify(response));
    id= response.id;
    $.cookie('gistId', id,{ expires: 1, path: '/' });
}

function gistsuccess(response) {
    console.log('success: ' + JSON.stringify(response));
    content=response.files["ToApprove.html"].content;
    //content=content.replace("</div>",'');
    var tutorialId=$.cookie('gistId');
    content=content+' <a href="tutorial?gistid='+tutorialId+'"><div class="bonecard" gistid="'+tutorialId+'"></div></a>'
    //content= response.files.
    var gisturl = "https://api.github.com/gists/" + "25aec40876dfb11f8d36";
    files={
        "description": "Bone101 tutorials at beagleboard.org",
            "files": {
                "Sitelist.html": {
                    "content": response.files["Sitelist.html"].content
                },
                "ToApprove.html": {
                    "content": content
                }
            }
        };
    
    var gistupdate = {
        type: "PATCH",
        url: gisturl,
        data: JSON.stringify(files), //JSON.stringify(Jfile),
        success: onsuccessUpdate,
        dataType: "json"
    };
    
    var token = $.cookie('githubToken');
    gistupdate.headers = {
        "Authorization": 'token ' + token
    };
    
    console.log('request: ' + JSON.stringify(gistupdate));
    $.ajax(gistupdate).fail(gistfailUpdate);
}

function onsuccessUpdate(response){
    var tutorialId=$.cookie('gistId');
    $.removeCookie('gistId', { path: '/' }); 
    path="tutorial.html?gistid="+tutorialId;
    $(location).attr('href', path);
}

function gistfailUpdate(response){
    $.removeCookie('gistId', { path: '/' }); 
    alert("Error creating the tutorial");
}

function gistfail(response){
    $.removeCookie('gistId', { path: '/' }); 
    alert("Error creating the tutorial");
}

function onfail(response) {
    $.removeCookie('gistId', { path: '/' }); 
    console.log('fail: ' + JSON.stringify(response));
    alert("Error creating the Tutorial");
}
                    
function createtutorial(){
    checkTab($("#listPreReq"), pagesPreReq, 1);
    checkTab($("#listHDReq"), pagesHDReq, 2);
    
    var tutorialId=$.cookie('gistId');
    files = create_Json(pagesPreReq, pagesHDReq);//createJson();
    
    if(tutorialId == undefined){
        var url = "https://api.github.com/gists";
        var mypost = {
            type: "POST",
            url: url,
            data: JSON.stringify(files), //JSON.stringify(Jfile),
            success: onsuccess,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        mypost.headers = {
            "Authorization": 'token ' + token
        };
        console.log("Doing post: " + JSON.stringify(mypost));
        $.ajax(mypost).fail(onfail);
    }
    else{
        var gisturl = "https://api.github.com/gists/" + tutorialId;
        var gistupdate = {
            type: "PATCH",
            url: gisturl,
            data: JSON.stringify(files), //JSON.stringify(Jfile),
            success: onsuccess,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };
        
        console.log('Doing patch: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(onfail);
        
    }
}                    

function autoSaveTutorial(){
    checkTab($("#listPreReq"), pagesPreReq, 1);
    checkTab($("#listHDReq"), pagesHDReq, 2);
    
    var tutorialId=$.cookie('gistId');
    files = create_Json(pagesPreReq, pagesHDReq);//createJson();
    
    if(tutorialId == undefined){
        var url = "https://api.github.com/gists";
        var mypost = {
            type: "POST",
            url: url,
            data: JSON.stringify(files), //JSON.stringify(Jfile),
            success: onsuccessAuto,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        mypost.headers = {
            "Authorization": 'token ' + token
        };
        console.log("Doing post: " + JSON.stringify(mypost));
        $.ajax(mypost).fail(onfail);
    }
    else{
        var gisturl = "https://api.github.com/gists/" + tutorialId;
        var gistupdate = {
            type: "PATCH",
            url: gisturl,
            data: JSON.stringify(files), //JSON.stringify(Jfile),
            success: onsuccessAuto,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };
        
        console.log('Doing patch: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(onfail);
        
    }
}                   
                    
                    
                    
