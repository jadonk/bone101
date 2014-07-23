/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function deleteUi(list, listActive, content, preview, code) {
    sizeList = list.find("li").size();
    if (sizeList > 1) {
        var id = listActive.attr("id").replace(/[CODE]*_|[HTML]*_/, '');//replace(/\r?\n|\r/g,'')
        var card = listActive.attr("id").replace(/_[0-9]*/, '');
        var text = listActive.text();
        var numId = parseInt(id);
        $("li:has('a'):contains(" + text + ")").remove();
        if (card == "HTML") {
            //content.splice(numId,1);
            content[id] = "DELETE";
        } else {
            code.splice(numId, 1);
        }
        $('.summernote_Small').code(preview.value);
        $(".note-editor").css({"margin-top": "-14%"});
        $('#myTab a:first').tab('show');

    }
};

function getSizeList(size, cardType) {
    var html = 0;
    var code = 0;
    for (i = 0; i < size.size(); i++) {
        if (size[i].getAttribute("id").replace(/_[0-9]*/, '') == "HTML") {
            html++;
        }
        else if (size[i].getAttribute("id").replace(/_[0-9]*/, '') == "CODE") {
            code++;
        }
    }
    if (cardType == "HTML") {
        return html;
    } else {
        return code;
    }

};

function addNewElement(list, listActive, content, code, preview, currentWindow, cardType) {
    var ps = list.find('li');
    psize = getSizeList(ps, cardType);
    var newLi = "";
    listActive.removeClass('active');
    if (currentWindow == "#tab_small") { //If the card is the preview card
        preview.value = $('.summernote_Small').code();
    } else if (currentWindow == "#tab_html") {//If the card is the html card
        newId = listActive.attr("id");
        saveInformation(list, newId, content, code, preview);
    } else if (currentWindow == "#tab_Code") {//If the card is the code card
        newId = listActive.attr("id");
        saveInformation(list, newId, content, code, preview);
    }
    if (cardType == "HTML") {
        newLi = addCardtoList("HTML", (ps.size() + 1), psize);
        list.append(newLi);
        $('.summernote').code("");
        $(".note-editor").css({"margin-top": "-6%"});
        $('#myTab a[href="#tab_html"]').tab('show');
    } else if (cardType == "CODE") {
        newLi = addCardtoList("CODE", (ps.size() + 1), psize);
        list.append(newLi);
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setValue("");
        $('#myTab a[href="#tab_Code"]').tab('show');
    }
};

function addCardtoList(card, psize, realSize) {
    var newLi = "";
    if (card == "HTML") {
        newLi = '<li class="active" id=HTML_' + realSize + '>';
        newLi = newLi + '<a href="#tab_html" data-toggle="pill">';
    } else if (card == "CODE") {
        newLi = '<li class="active" id=CODE_' + realSize + '>';
        newLi = newLi + '<a href="#tab_Code" data-toggle="pill">';
    }
    newLi = newLi + '<span  class="display edit_text">Card ' + psize + '</span>';
    newLi = newLi + '<input type="text" class="edit" style="display:none"/></a></li>';
    return newLi;
};

function saveInformation(list, id, content, code, preview) {

    var typeId = id.replace(/_[0-9]*/, '');
    var idNumber = id.replace(/[CODE]*_|[HTML]*_/, '');
    if (typeId == "cZero") {
        preview.value = $('.summernote_Small').code();
    }
    else if (typeId == "HTML") {
        //var num= id.replace(/[CODE]*_|[HTML]*_/,'');
        var numids = getpostion(list, idNumber, typeId);
        //var numids=parseInt(num);
        if (numids <= content.length) {
            content[idNumber] = $('.summernote').code();
        }
        else {
            content.push($('.summernote').code());
            $('.summernote').code("");
        }
    } else if (typeId == "CODE") {
        // var num= id.replace(/[CODE]*_|[HTML]*_/,'');
        var numids = getpostion(list, idNumber, typeId);
        //var numids=parseInt(num);
        var editor = ace.edit("editor");
        var obj = {value: '', language: ''};
        obj.value = editor.getSession().getValue();
        obj.language = $("#comboLanguages option:selected").text();
        if (numids <= code.length) {
            code[idNumber] = obj;
        }
        else {
            code.push(obj);
        }
    }
};

function updateEditor(list, id, content, code, preview) {
    idName = id.replace(/_[0-9]*/, '');
    idNumber = id.replace(/[CODE]*_|[HTML]*_/, '');
    if (id == "cZero") {
        $('.summernote_Small').code(preview.value);
    }
    else if (idName == "CODE") {
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        if (code.length > 0) {
            editor.getSession().setValue(code[idNumber].value);
            $('.selectpicker').val(code[idNumber].language);
            $('.selectpicker').selectpicker('render');
            if(code[idNumber].language == "Javascript"){
                editor.getSession().setMode("ace/mode/javascript");
            }
            else if(code[idNumber].language == "Python"){
                editor.getSession().setMode("ace/mode/python");
            }
            else if(code[idNumber].language == "Ruby"){
                editor.getSession().setMode("ace/mode/ruby");
            }
            else if(code[idNumber].language == "Java"){
                editor.getSession().setMode("ace/mode/java");
            }
        }
    }
    else {
        var numids = getpostion(list, idNumber, idName);//parseInt(id);
        if (content.length > 0) {
            $('.summernote').code(content[idNumber]);
        }
    }
};

function getpostion(list, idNumber, idName) {
    var counterHTML = 0;
    var counterCODE = 0;
    var psize = list.find('li');
    for (i = 0; i < psize.length; i++) {
        if (psize[i].id == "cZero") {

        }
        else if (psize[i].id.replace(/_[0-9]*/, '') == "HTML") {
            if (psize[i].id.replace(/[CODE]*_|[HTML]*_/, '') == idNumber && idName == "HTML") {
                return counterHTML;
            } else {
                counterHTML++;
            }
        }
        else {
            if (psize[i].id.replace(/[CODE]*_|[HTML]*_/, '') == idNumber && idName == "CODE") {
                return counterCODE;
            } else {
                counterCODE++;
            }
        }
    }
    if (idName == "HTML") {
        return counterHTML.toString();
    } else {
        return counterCODE.toString();
    }
};

function changeElement(list, listActive, newIds, content, code, preview) {
    var id = listActive.attr("id");
    saveInformation(list, id, content, code, preview);
};

function changeElementothers(list, listActive, content, code, preview) {
    var id = listActive.attr("id");
    saveInformation(list, id, content, code, preview);
};

function checkTab(list, arrayList, editor) {
    var Prevalue = $('.summernote').eq(editor).code();
    if (Prevalue.length > 11) {
        var Psize = list.find('li');
        Psize = Psize.size();
        if (arrayList.length < Psize) {
            arrayList.push(Prevalue);
        }
    }
};

function getNameCodeCard(num, str) {
    var name="";
    if (str == "Javascript") {
       name="CARD_" + (num) + ".js";
    } else if (str == "Ruby") {
       name="CARD_" + (num) + ".rb";
    } else if (str == "Python") {
       name="CARD_" + (num) + ".py"; 
    } else if (str == "Java") {
       name="CARD_" + (num) + ".java"; 
    }
    return name;
};

var create_Json = function create_Json(list, content, code, preview, ob, flag) {
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {}
    };
    if (flag == true) {
        var listLi = list.find('li');
        var name = "CARD_Preview.html";
        var x = 0;//naming the cards
        var contCode = 0;
        var contContent = 0;
        obj = {};
        for (i = 0; i < listLi.length; i++) {
            if (i == 0) {
                Jfile["files"][name] = {"content": preview.value};
            }
            else {
                if (listLi[i].id.replace(/_[0-9]*/, '') == "CODE") {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    //na=listLi[i].children[0].children[0].innerHTML
                    if (code[numId].value != "") {
                        name = getNameCodeCard(x,code[numId].language);
                        obj = {"content": code[numId].value};
                        Jfile["files"][name] = obj;
                        obj = {"name": name, "content": code[numId].value}
                        ob[x] = obj;
                        x++;
                    }
                }
                else {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (content[numId] != undefined) {
                        if (content[numId].length > 0) {
                            name = "CARD_" + x + ".html";
                            obj = {"content": content[numId]};
                            x++;
                            Jfile["files"][name] = obj;
                            obj = {"name": name, "content": content[numId]}
                            ob[x] = obj;
                        }
                    }
                }

            }
        }
        console.log(JSON.stringify(Jfile));
        return Jfile;
    } else {
        var listLi = list.find('li');
        var name = "CARD_Preview.html";
        var x = 0, y = 0, id = 0;
        obj = {};
        var existCard = ob.length;
        for (i = 0; i < listLi.length; i++) {
            if (i == 0) {
                Jfile["files"][name] = {"content": preview.value};
            }
            else {
                if (listLi[i].id.replace(/_[0-9]*/, '') == "CODE") {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                     if (code[numId].value != "") {
                        name = getNameCodeCard(x,code[numId].language);
                        id++;
                        if (Object.size(ob) > (i - 1)) {
                            obj = {"filename": name, "content": code[numId].value};
                            Jfile["files"][ob[y].name] = obj;
                            //ob[name]=code.value;
                            obj = {"name": name, "content": code[numId].value}
                            ob[y] = obj;
                            y++;
                        }
                        else {
                            obj = {"content": code[numId].value};
                            Jfile["files"][name] = obj;
                            obj = {"name": name, "content": code[numId].value}
                            ob[y] = obj;
                            y++;
                        }
                    }
                }
                else {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (content[numId] != undefined) {
                        if (content[numId].length > 0) {

                            name = "CARD_" + id + ".html";
                            id++;
                            if (Object.size(ob) > (i - 1)) {
                                obj = {"filename": name, "content": content[numId]};

                                Jfile["files"][ob[y].name] = obj;
                                obj = {"name": name, "content": content[numId]}
                                ob[y] = obj;
                                x++;
                                y++;
                            }
                            else {
                                obj = {"content": content[numId]};

                                Jfile["files"][name] = obj;
                                obj = {"name": name, "content": content[numId]}
                                ob[y] = obj;
                                x++;
                                y++;
                            }
                        }
                    }

                }

            }
        }
        var value = "";
        for (i = 0; i < listLi.length; i++) {
            value = value + listLi[i].children[0].children[0].innerHTML + "\n";
        }
        obj = {"content": value};
        name = "CardList.html";
        Jfile["files"][name] = obj;

        console.log(JSON.stringify(Jfile));
        return Jfile;
    }


};

var create_JsonSave = function create_JsonSave(list, content, code, preview, ob, flag) {
    Jfile = {
        "description": "Bone101 Tutorial",
        "public": true,
        "files": {}
    };
    if (flag == true) {
        var listLi = list.find('li');
        var name = "CARD_Preview.html";
        var x = 0;
        obj = {};
        for (i = 0; i < listLi.length; i++) {
            if (i == 0) {
                Jfile["files"][name] = {"content": preview.value};
            }
            else {
                if (listLi[i].id.replace(/_[0-9]*/, '') == "CODE") {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (code[numId].value != "") {
                        name = getNameCodeCard(x,code[numId].language);
                        obj = {"content": code[numId].value};
                        Jfile["files"][name] = obj;
                        obj = {"name": name, "content": code[numId].value}
                        ob[x] = obj;
                        x++;
                    }
                }
                else {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (content[numId] != undefined) {
                        if (content[numId].length > 0) {
                            name = "CARD_" + x + ".html";
                            obj = {"content": content[numId]};
                            x++;
                            Jfile["files"][name] = obj;
                            obj = {"name": name, "content": content[numId]}
                            ob[x] = obj;
                        }
                    }
                }

            }
        }
        console.log(JSON.stringify(Jfile));

    } else {
        var listLi = list.find('li');
        var name = "CARD_Preview.html";
        var x = 0, y = 0, id = 0;
        obj = {};
        var existCard = ob.length;
        for (i = 0; i < listLi.length; i++) {
            if (i == 0) {
                Jfile["files"][name] = {"content": preview.value};
            }
            else {
                if (listLi[i].id.replace(/_[0-9]*/, '') == "CODE") {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (code[numId].value != "") {
                        name = getNameCodeCard(x,code[numId].language);
                        id++;
                        if (Object.size(ob) > (i - 1)) {
                            obj = {"filename": name, "content": code[numId].value};
                            Jfile["files"][ob[y].name] = obj;
                            //ob[name]=code.value;
                            obj = {"name": name, "content": code[numId].value}
                            ob[y] = obj;
                            y++;
                        }
                        else {
                            obj = {"content": code[numId].value};
                            Jfile["files"][name] = obj;
                            obj = {"name": name, "content": code[numId].value}
                            ob[y] = obj;
                            y++;
                        }
                    }
                }
                else {
                    var numId = listLi[i].id.replace(/[CODE]*_|[HTML]*_/, '');
                    if (content[numId] != undefined) {
                        if (content[numId].length > 0) {
                            name = "CARD_" + id + ".html";
                            id++;
                            if (Object.size(ob) > (i - 1)) {
                                obj = {"filename": name, "content": content[numId]};

                                Jfile["files"][ob[y].name] = obj;
                                obj = {"name": name, "content": content[numId]}
                                ob[y] = obj;
                                x++;
                                y++;
                            }
                            else {
                                obj = {"content": content[numId]};

                                Jfile["files"][name] = obj;
                                obj = {"name": name, "content": content[numId]}
                                ob[y] = obj;
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


    var value = "";
    for (i = 0; i < listLi.length; i++) {
        value = value + listLi[i].children[0].children[0].innerHTML + "\n";
    }
    obj = {"content": value};
    name = "CardList.html";
    Jfile["files"][name] = obj;

    console.log(JSON.stringify(Jfile));
    return Jfile;
};

function onsuccess(response) {
    console.log('success: ' + JSON.stringify(response));
    id = response.id;
    $.cookie('gistidEdit', id, {expires: 1, path: '/'});

    var gisturl = "https://api.github.com/gists/" + "25aec40876dfb11f8d36";
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistsuccess,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
};

function onsuccessAuto(response) {
    console.log('success: ' + JSON.stringify(response));
    id = response.id;
    $.cookie('gistidEdit', id, {expires: 1, path: '/'});
    var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist ;
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistAutoSave,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
};

function gistAutoSave(response){
    console.log('success: ' + JSON.stringify(response));
     var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist;
    var tutorial = $.cookie('gistidEdit');
    var newC=JSON.parse(response.files["autosave.json"].content);
    var available = _.find(newC, { 'id': tutorial });
    if(available == undefined){
        var size=newC.length;
        newC[size]={"id": tutorial};
        newC = JSON.stringify(newC);
        files = {
            "description": "BONELIST",
            "public": true,
            "files": {
                "autosave.json": {
                    "content": newC
                },
                "save.json": {
                    "content": response.files["save.json"].content
                }
            }
        };
        var gistupdate = {
           type: "PATCH",
           url: gisturl,
           data: JSON.stringify(files), //JSON.stringify(Jfile),
           success: onsuccessUpdateGist,
           dataType: "json"
       };
    
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };

        console.log('request: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(gistfailUpdate);
    }
};

function deleteRecordByFileName (myArr, fileName) {
    var index = null;
    for (var i =0; i < myArr.length; i++) {
        if (myArr[i].id === fileName) {
            index = i;
            break;
        }
    }
    if (index !== null) {
        myArr.splice(index, 1);
    }
};

function gistAutoSaveCreate(response){
    console.log('success: ' + JSON.stringify(response));
    var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist;
    var tutorial = $.cookie('gistidEdit');
    var newC=JSON.parse(response.files["save.json"].content);
    var autoJ=JSON.parse(response.files["autosave.json"].content);
    var availableSave = _.find(newC, { 'id': tutorial });
    var availableAuto = _.find(autoJ, { 'id': tutorial });
    if(availableSave == undefined || availableAuto == undefined){
        var size=newC.length;
        newC[size]={"id": tutorial};
        newC = JSON.stringify(newC);
        deleteRecordByFileName(autoJ,tutorial);
        autoJ = JSON.stringify(autoJ);
        files = {
            "description": "BONELIST",
            "public": true,
            "files": {
                "autosave.json": {
                    "content": autoJ
                },
                "save.json": {
                    "content": newC
                }
            }
        };
        var gistupdate = {
           type: "PATCH",
           url: gisturl,
           data: JSON.stringify(files), //JSON.stringify(Jfile),
           success: onsuccessCreateGist,
           dataType: "json"
        };
    
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };

        console.log('request: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(gistfailUpdate);
    }
    else{
        var tutorialId = $.cookie('gistidEdit');
        $.removeCookie('gistidEdit', {path: '/'});
        path = "tutorial.html?gistid=" + tutorialId;
        $(location).attr('href', path);
    }
};

function onsuccessUpdateGist(response){
    console.log('success: ' + JSON.stringify(response));
};

function onsuccessCreateGist(response){
    console.log('success: ' + JSON.stringify(response));
    var tutorialId = $.cookie('gistidEdit');
    $.removeCookie('gistidEdit', {path: '/'});
    path = "tutorial.html?gistid=" + tutorialId;
    $(location).attr('href', path);
};

function gistsuccess(response) {
    console.log('success: ' + JSON.stringify(response));
    content = response.files["ToApprove.html"].content;
   
    var tutorialId = $.cookie('gistidEdit');
    if(content.indexOf(tutorialId)<0){
    content = content + ' <a href="tutorial?gistid=' + tutorialId + '"><div class="bonecard" gistid="' + tutorialId + '"></div></a>'
   
    var gisturl = "https://api.github.com/gists/" + "25aec40876dfb11f8d36";
    files = {
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
    else{
        var tutorialId = $.cookie('gistidEdit');
        $.removeCookie('gistidEdit', {path: '/'});
        path = "tutorial.html?gistid=" + tutorialId;
        $(location).attr('href', path);
    }

};

function onsuccessUpdate(response) {
    var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist ;
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistAutoSaveCreate,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
    
};

function gistfailUpdate(response) {
    console.log('ERROR Function gistfailUpdate: ' + JSON.stringify(response));
    //$.removeCookie('gistidEdit', {path: '/'});
    //alert("Error creating the tutorial --  Function gistfailUpdate");
};

function gistfail(response) {
     console.log('ERROR Function gistfail: ' + JSON.stringify(response));
//$.removeCookie('gistidEdit', {path: '/'});
    //alert("Error creating the tutorial -- Function gistFail");
};

function onfail(response) {
   // $.removeCookie('gistidEdit', {path: '/'});
    console.log('ERROR Function onfail: ' + JSON.stringify(response));
    //alert("Error creating the Tutorial -- Function onFail");
};

function createtutorial(list, content, code, preview, ob) {
    var tutorialId = $.cookie('gistidEdit');

    if (tutorialId == undefined) {
        files = create_JsonSave(list, content, code, preview, ob, true);
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
    else {
        files = create_JsonSave(list, content, code, preview, ob, false);
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
};

function autoSaveTutorial(list, content, code, preview, ob) {
    var tutorialId = $.cookie('gistidEdit');
    if (tutorialId == undefined) {
        files = create_Json(list, content, code, preview, ob, true);
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
    else {
        files = create_Json(list, content, code, preview, ob, false);
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
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function checktutorialFork(){
    var saveID = $.cookie('gistSaveId');
    if(saveID == undefined){
        alert("You need to login for forking this tutorial");
    }
    var gistid = getParameterByName('gistid');
    if(gistid){
        var gisturl = "https://api.github.com/gists/" + gistid+"/forks";
        var gistrequest = {
            type: "POST",
            url: gisturl,
            success: forkTutorial
        };
        var token = $.cookie('githubToken');
        gistrequest.headers = {
            "Authorization": 'token ' + token
        };
        console.log('request for checkforEdit: ' + JSON.stringify(gistrequest));
        $.ajax(gistrequest).fail(forkFail);
    }
}
var forkID={value:''};

function forkTutorial(response){    
    console.log("Forking Detail: "+ JSON.stringify(response));
    forkID.value=response.id;
    var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist ;
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistForkRequest,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
}

function gistForkRequest(response){
    console.log('gistForkRequest: ' + JSON.stringify(response));
     var savingGist = $.cookie('gistSaveId');
    var gisturl = "https://api.github.com/gists/" +savingGist;
    //.var tutorial = $.cookie('gistidEdit');
    var newC=JSON.parse(response.files["autosave.json"].content);
    //var available = _.find(newC, { 'id': tutorial });
    //if(available == undefined){
        var size=newC.length;
        newC[size]={"id": forkID.value};
        newC = JSON.stringify(newC);
        files = {
            "description": "BONELIST",
            "public": true,
            "files": {
                "autosave.json": {
                    "content": newC
                },
                "save.json": {
                    "content": response.files["save.json"].content
                }
            }
        };
        var gistupdate = {
           type: "PATCH",
           url: gisturl,
           data: JSON.stringify(files), //JSON.stringify(Jfile),
           success: onsuccessForkGist,
           dataType: "json"
       };
    
        var token = $.cookie('githubToken');
        gistupdate.headers = {
            "Authorization": 'token ' + token
        };

        console.log('request: ' + JSON.stringify(gistupdate));
        $.ajax(gistupdate).fail(gistfailUpdate);
    //}
}

function onsuccessForkGist(response){
    console.log('onsuccessForkGist: ' + JSON.stringify(response));
    path = "edit.html?gistid=" + forkID.value;
    $(location).attr('href', path);
    
}

function forkFail(response){
    console.log("Forking ERROR: "+ JSON.stringify(response));
}

function checktutorialEdit(){
    var saveID = $.cookie('gistSaveId');
    if(saveID == undefined){
        alert("You need to login for editing this tutorial");
    }
    var gistid = getParameterByName('gistid');
    if(gistid){
        var gisturl = "https://api.github.com/gists/" + saveID;
        var gistrequest = {
            type: "GET",
            url: gisturl,
            success: checkEditTutorial,
            dataType: "json"
        };
        console.log('request for checkforEdit: ' + JSON.stringify(gistrequest));
        $.ajax(gistrequest).fail(failedit);
    }
}

function checkEditTutorial(response){
    var autosaveInfo=JSON.parse(response.files["autosave.json"].content);
    var savingInfo=JSON.parse(response.files["save.json"].content);
    var gistid = getParameterByName('gistid');
    var availableAutoSave = _.find(autosaveInfo, { 'id': gistid });
    var availableSave = _.find(savingInfo, { 'id': gistid });
    if(availableAutoSave != undefined || availableSave != undefined ){
        path = "edit.html?gistid=" + gistid;
        $(location).attr('href', path);
    }else{
        alert("You need to fork this tutorial before editing it");
    }
}

function checkforEdit(){
    var saveID = $.cookie('gistSaveId');
    var gistid = getParameterByName('gistid');
    if(gistid){
        var gisturl = "https://api.github.com/gists/" + saveID;
        var gistrequest = {
            type: "GET",
            url: gisturl,
            success: checkSuccessForEdit,
            dataType: "json"
        };
        console.log('request for checkforEdit: ' + JSON.stringify(gistrequest));
        $.ajax(gistrequest).fail(failedit);
    }
}

function checkSuccessForEdit(response){
    var autosaveInfo=JSON.parse(response.files["autosave.json"].content);
    var savingInfo=JSON.parse(response.files["save.json"].content);
    var gistid = getParameterByName('gistid');
    var availableAutoSave = _.find(autosaveInfo, { 'id': gistid });
    var availableSave = _.find(savingInfo, { 'id': gistid });
    if(availableAutoSave != undefined || availableSave != undefined ){
        loadTutorial();
    }else{
        alert("Tutorial doesn't exits");
    }
}

function checkingTutorialFail(response){
      console.log("Error loadinding tutorial info -- Function checkingTutorialFail"+ JSON.stringify(response));
}

function loadTutorial(){
    var gistid = getParameterByName('gistid');
    if(gistid){
        var gisturl = "https://api.github.com/gists/" + gistid;
        var gistrequest = {
            type: "GET",
            url: gisturl,
            success: edittutorial,
            dataType: "json"
        };
        console.log('request: ' + JSON.stringify(gistrequest));
        $.ajax(gistrequest).fail(failedit);
    }
};

function edittutorial(response){
    var id=response.id;
    var typeCard=[];
    $.cookie('gistidEdit', id, {expires: 1, path: '/'});
    preview.value=response.files["CARD_Preview.html"].content;
    for (var i in response.files){
    //for(i=1;i<response.files.length;i++){
        if(i!="CardList.html" || i == "CARD_Preview.html" ){
            
            if(response.files[i].filename.indexOf(".html")>0){
                content.push(response.files[i].content);
                typeCard.push("H");
            }
            else if(response.files[i].filename.indexOf(".js")>0){
                obj={value:response.files[i].content ,language:"Javascript"};
                code.push(obj);
                typeCard.push("C");
            }
            else if(response.files[i].filename.indexOf(".java")>0){
                obj={value:response.files[i].content ,language:"Java"};
                code.push(obj);
                typeCard.push("C");
            }
            else if(response.files[i].filename.indexOf(".rb")>0){
                obj={value:response.files[i].content ,language:"Ruby"};
                code.push(obj);
                typeCard.push("C");
            }
            else if(response.files[i].filename.indexOf(".py")>0){
                obj={value:response.files[i].content ,language:"Python"};
                code.push(obj);
                typeCard.push("C");
            }
        }
    }
    var listofCard = response.files["CardList.html"].content.replace(/\n/g, ",").slice(0,-1);
    var arrListofCards = listofCard.split(",");
    arrListofCards.shift(); 
    createCards(arrListofCards,typeCard);
    
};

function failedit(response){
    console.log("Error loadinding tutorial info -- Function failedit"+ JSON.stringify(response));
};

function createCards(listofCard, typeofCard) {
    var counterCode=0;
    var counterHTML=0;
    var newLi = "";
    for(i=0;i<listofCard.length;i++){
        if(typeofCard[i]=="C"){
            newLi = newLi + '<li id=CODE_' + counterCode + '>';
            newLi = newLi + '<a href="#tab_Code" data-toggle="pill">';
            newLi = newLi + '<span  class="display edit_text">' + listofCard[i] + '</span>';
            newLi = newLi + '<input type="text" class="edit" style="display:none"/></a></li>';
            counterCode++;
        }
        else if(typeofCard[i]=="H"){
            newLi = newLi + '<li id=HTML_' + counterHTML + '>';
            newLi = newLi + '<a href="#tab_html" data-toggle="pill">';
            newLi = newLi + '<span  class="display edit_text">' + listofCard[i] + '</span>';
            newLi = newLi + '<input type="text" class="edit" style="display:none"/></a></li>';
            counterHTML++;
        }
    }
    $("#myTab").append(newLi);
    $('.summernote_Small').code(preview.value);
    //return newLi;
};