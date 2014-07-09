/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
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
}*/

function deleteUi(list,listActive,content,preview){
    sizeList = list.find("li").size();
    if(sizeList > 1){
        var id=listActive.attr("id");
        var text=listActive.text();
        var numId=parseInt(id)-1;
        $("li:has('a'):contains("+text+")").remove();
        content.splice(numId,1)
        $('.summernote').code(preview.value);
        $('#myTab a:first').tab('show');
    }
}

function addNewElement(list,listActive,content,code,preview){
    var psize= list.find('li');
    listActive.removeClass('active');
    var id=listActive.attr("id");
    if(id == "cZero"){
        preview.value=$('.summernote').code();
    }
    else if(id == "cardCode"){
        var editor = ace.edit("editor");
        code.value = editor.getSession().getValue();
        editor.getSession().setValue("");
    }
    else{
        content.push($('.summernote').code());
    }
    psize = psize.size()-1;
    var newLi='<li class="active" id='+psize+'>';
    newLi=newLi+'<a href="#tab_preview" data-toggle="pill">';
    newLi=newLi+'<span  class="display edit_text">Card '+psize+'</span>';
    newLi=newLi+'<input type="text" class="edit" style="display:none"/></a></li>';
    list.append(newLi);
    $('.summernote').code("");
    $('#myTab a[href="#tab_preview"]').tab('show');
    
}

function saveInformation(id,content,code,preview){
    if(id == "cZero"){
        preview.value=$('.summernote').code();
    }
    else if(id == "cardCode"){
        var editor = ace.edit("editor");
        code.value=editor.getSession().getValue();
    }
    else{
        var numids=parseInt(id);
        if (numids <= content.length  ){
            content[numids-1]= $('.summernote').code();
        }
        else{
            content.push($('.summernote').code());
        }
    }
}

function updateEditor(list,id,content,code,preview){
    if(id == "cZero"){
        $('.summernote').code(preview.value);
    }
    else if(id == "cardCode"){
        var editor = ace.edit("editor");
        editor.getSession().setValue(code.value);
    }
    else{
        var numids=getpostion(list,id);//parseInt(id);
        $('.summernote').code(content[numids]);
    }
}

function getpostion(list,id){
    var counter=0;
    var psize= list.find('li');
    for(i=0;i<psize.length;i++){
        if(psize[i].id == "cardCode" || psize[i].id =="cZero" ){
            
        }
        else if(psize[i].id == id){
            return counter;
        }
        else{
            counter++;
        }
    }
    return counter;
}

function changeElement(list,listActive,newIds,content,code,preview){
    var id=listActive.attr("id");
    saveInformation(id,content,code,preview);
    updateEditor(list,newIds,content,code,preview);
}

function changeElementothers(listActive,content,code,preview){
    var id=listActive.attr("id");
    saveInformation(id,content,code,preview);
    //updateEditor(newIds,content,code,preview);
}

/*
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
}*/           
            
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

var create_Json = function createJson(list,content,code,preview,ob,flag){
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {}
    };
    if(flag == true){
        var listLi= list.find('li');
        var  name="CARD_Preview.html";
        var x=0;
        obj={};     
        for(i=0;i<listLi.length;i++){
            if(i == 0){
                Jfile["files"][name]={"content": preview.value};
            }
            else{
                if(listLi[i].id == "cardCode"){
                    //na=listLi[i].children[0].children[0].innerHTML
                    if(code.value !=""){
                        name="CARD_"+(x)+".js";
                        obj={"content": code.value};
                        Jfile["files"][name]=obj;
                        obj={"name":name,"content": code.value}
                        ob[x]=obj;
                        x++;
                    }
                }
                else{
                    //na=listLi[i].children[0].children[0].innerHTML;
                    if(content[x] != undefined){
                        if(content[x].length > 0){
                            name="CARD_"+x+".html";
                            obj={"content": content[x]};
                            x++;
                            Jfile["files"][name]=obj;
                            obj={"name":name,"content": content[x]}
                            ob[x]=obj;
                        }
                    }
                }

            }
        }
        console.log(JSON.stringify(Jfile));
        return Jfile;
    }else{
        var listLi= list.find('li');
        var  name="CARD_Preview.html";
        var x=0,y=0,id=0;
        obj={};
        var existCard=ob.length;
        for(i=0;i<listLi.length;i++){
            if(i == 0){
                Jfile["files"][name]={"content": preview.value};
            }
            else{
                if(listLi[i].id == "cardCode"){
                    if(code.value !=""){
                        name="CARD_"+(id)+".js";
                        id++;
                        if(Object.size(ob) > (i-1) ){
                            obj={"filename": name,"content": code.value};
                            Jfile["files"][ob[y].name]=obj;
                            //ob[name]=code.value;
                            obj={"name":name,"content": code.value}
                            ob[y]=obj;
                            y++;
                        }
                        else{
                            obj={"content": code.value};
                            Jfile["files"][name]=obj;
                            obj={"name":name,"content": code.value}
                            ob[y]=obj;
                            y++;
                        }
                    }
                }
                else{
                    //na=listLi[i].children[0].children[0].innerHTML;
                        if(content[x] != undefined){
                            if(content[x].length > 0   ){

                                name="CARD_"+id+".html";
                                id++;
                                if(Object.size(ob) > (i-1) ){
                                    obj={"filename": name,"content": content[x]};

                                    Jfile["files"][ob[y].name]=obj;
                                    obj={"name":name,"content": content[x]}
                                    ob[y]=obj;
                                    x++;
                                    y++;
                                }
                                else{
                                    obj={"content": content[x]};

                                    Jfile["files"][name]=obj;
                                    obj={"name":name,"content": content[x]}
                                    ob[y]=obj;
                                    x++;
                                    y++;
                                }
                            }
                        }
                    
                }

            }
        }
        var value="";
        for(i=0;i<listLi.length;i++){
            value=value+listLi[i].children[0].children[0].innerHTML+"\n";
        }
        obj={"content": value};
        name="CardList.html";
        Jfile["files"][name]=obj;
    
        console.log(JSON.stringify(Jfile));
        return Jfile;
    }
   
    
}

var create_JsonSave = function create_JsonSave(list,content,code,preview){
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {}
    };
    if(flag == true){
        var listLi= list.find('li');
        var  name="CARD_Preview.html";
        var x=0;
        obj={};     
        for(i=0;i<listLi.length;i++){
            if(i == 0){
                Jfile["files"][name]={"content": preview.value};
            }
            else{
                if(listLi[i].id == "cardCode"){
                    //na=listLi[i].children[0].children[0].innerHTML
                    if(code.value !=""){
                        name="CARD_"+(x)+".js";
                        obj={"content": code.value};
                        Jfile["files"][name]=obj;
                        obj={"name":name,"content": code.value}
                        ob[x]=obj;
                        x++;
                    }
                }
                else{
                    //na=listLi[i].children[0].children[0].innerHTML;
                    if(content[x] != undefined){
                        if(content[x].length > 0){
                            name="CARD_"+x+".html";
                            obj={"content": content[x]};
                            x++;
                            Jfile["files"][name]=obj;
                            obj={"name":name,"content": content[x]}
                            ob[x]=obj;
                        }
                    }
                }

            }
        }
        console.log(JSON.stringify(Jfile));
       
    }else{
        var listLi= list.find('li');
        var  name="CARD_Preview.html";
        var x=0,y=0,id=0;
        obj={};
        var existCard=ob.length;
        for(i=0;i<listLi.length;i++){
            if(i == 0){
                Jfile["files"][name]={"content": preview.value};
            }
            else{
                if(listLi[i].id == "cardCode"){
                    if(code.value !=""){
                        name="CARD_"+(id)+".js";
                        id++;
                        if(Object.size(ob) > (i-1) ){
                            obj={"filename": name,"content": code.value};
                            Jfile["files"][ob[y].name]=obj;
                            //ob[name]=code.value;
                            obj={"name":name,"content": code.value}
                            ob[y]=obj;
                            y++;
                        }
                        else{
                            obj={"content": code.value};
                            Jfile["files"][name]=obj;
                            obj={"name":name,"content": code.value}
                            ob[y]=obj;
                            y++;
                        }
                    }
                }
                else{
                    //na=listLi[i].children[0].children[0].innerHTML;
                    if(content[x] != undefined){
                        if(content[x].length > 0){
                            name="CARD_"+id+".html";
                            id++;
                            if(Object.size(ob) > (i-1) ){
                                obj={"filename": name,"content": content[x]};

                                Jfile["files"][ob[y].name]=obj;
                                obj={"name":name,"content": content[x]}
                                ob[y]=obj;
                                x++;
                                y++;
                            }
                            else{
                                obj={"content": content[x]};

                                Jfile["files"][name]=obj;
                                obj={"name":name,"content": content[x]}
                                ob[y]=obj;
                                x++;
                                y++;
                            }
                        }
                    }
                }

            }
        }
        console.log(JSON.stringify(Jfile));
        
    }
    
   
    var value="";
    for(i=0;i<listLi.length;i++){
        value=value+listLi[i].children[0].children[0].innerHTML+"\n";
    }
    obj={"content": value};
    name="CardList.html";
    Jfile["files"][name]=obj;
    
    console.log(JSON.stringify(Jfile));
    return Jfile;
}


/*
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
*/
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
                    
function createtutorial(list,content,code,preview,ob){
    var tutorialId=$.cookie('gistId');
    
    if(tutorialId == undefined){
        files = create_JsonSave(list,content,code,preview,ob,true);
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
        files = create_JsonSave(list,content,code,preview,ob,false);
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

function autoSaveTutorial(list,content,code,preview,ob){
    var tutorialId=$.cookie('gistId');
    if(tutorialId == undefined){
        files = create_Json(list,content,code,preview,ob,true);
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
        files = create_Json(list,content,code,preview,ob,false);
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

/*
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
} */         