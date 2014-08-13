/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//document.write('<scr'+'ipt type="text/javascript" src="../js/oauth.js" ></scr'+'ipt>');
OAuth.initialize('wksJjQzMRCHmhVK7u4ry_k72ON4');
var auth;
var start = function(){
  
    //var login = function login(){ 
        OAuth.popup('github', function(err, result) {
            console.log(err);
            auth = result;
            token= auth.access_token;
            $.cookie('githubToken', token,{ expires: 1, path: '/' });
            auth.me().done(function(me) {
                user=me.name;
                $.cookie('githubUser', user,{ expires: 1, path: '/' });
                $('a#user').append(user);
                $('a#user').append('<span class="caret"></span>');
                $('ul#dropNameU').append('<li><a id="profile" href="#">Profile</a></li>');
                $('ul#dropNameU').append('<li><a id="logout" href="#"><i class="icon-login"></i>Logout</a></li>');
                $("a#create").attr("href", "create.html");
                $("a#create").append("Create");
                $("a#login").empty();
                $("a#login").attr("href", "#");
             
                if($.cookie('githubToken')!=null){
                var username=me.alias;
                $.cookie('githubUserName', username,{ expires: 1, path: '/' });
                var gisturl = "https://api.github.com/users/"+username+"/gists?per_page=100&page=1";
                var gistrequest = {
                    type: "GET",
                    url: gisturl,
                    success: gistsuccess
                };
                var token = $.cookie('githubToken');
                gistrequest.headers = {
                    "Authorization": 'token ' + token
                };
               // console.log('request: ' + JSON.stringify(gistrequest));
                $.ajax(gistrequest).fail(gistfail);
        }
                
            })
        });
        
        
    //};
};

var startTutorial = function(){
  
    //var login = function login(){ 
        OAuth.popup('github', function(err, result) {
            //console.log(err);
            auth = result;
            token= auth.access_token;
            $.cookie('githubToken', token,{ expires: 1, path: '/' });
            auth.me().done(function(me) {
                user=me.name;
                $.cookie('githubUser', user,{ expires: 1, path: '/' });
                
                
                if($.cookie('githubToken')!=null){
                var username=me.alias;  
                $.cookie('githubUserName', username,{ expires: 1, path: '/' });
                var gisturl = "https://api.github.com/users/"+username+"/gists?per_page=100&page=1";
                var gistrequest = {
                    type: "GET",
                    url: gisturl,
                    success: gistsuccess
                };
                var token = $.cookie('githubToken');
                gistrequest.headers = {
                    "Authorization": 'token ' + token
                };
               // console.log('request: ' + JSON.stringify(gistrequest));
                $.ajax(gistrequest).fail(gistfail);
        }
                
            })
        });
        
        
    //};
};

function onsuccess(response){
    var token =response.id;
    $.cookie('gistSaveId', token,{ expires: 1, path: '/' });
}

function createJson(){
    var autoS=[{'id': 'THISISTHEFIRSTIDYOUWOULDNTUSE'}];
    var save=[{'id': 'THISISTHEFIRSTIDYOUWOULDNTUSE'}];
    Jfile = {
        "description": "BONELIST",
        "public": true,
        "files": {
            "autosave.json": {
                "content": '[{"id": "THISISTHEFIRSTIDYOUWOULDNTUSE"}]'
            },
            "save.json": {
                "content": '[{"id": "THISISTHEFIRSTIDYOUWOULDNTUSE"}]'
            }
        }
    };
    //console.log(JSON.stringify(Jfile));
    return Jfile;
}

function gistsuccess(response){
    // console.log('success: ' + JSON.stringify(response));
     files = createJson();
     
     var newdata = response;
     var available = _.find(newdata, { 'description': "BONELIST" });
     if(available == undefined){
        var url = "https://api.github.com/gists";
        var mypost = {
            type: "POST",
            url: url,
            data: JSON.stringify(files), 
            success: onsuccess,
            dataType: "json"
        };
        var token = $.cookie('githubToken');
        mypost.headers = {
            "Authorization": 'token ' + token
        };
        //console.log("Doing post: " + JSON.stringify(mypost));
        $.ajax(mypost).fail(gistfail);
     }
     else{
         var token=available.id;
         $.cookie('gistSaveId', token,{ expires: 1, path: '/' });
     }

}

function gistfail(response) {
    Console.log(JSON.stringify(response));
//$.removeCookie('gistId', {path: '/'});
    //alert("Error creating the tutorial");
}

var logout = function(){
     $.removeCookie('githubUser', { path: '/' });
     $.removeCookie('githubToken',{  path: '/' });
     $.removeCookie('gistSaveId',{  path: '/' });
     $.removeCookie('githubUserName',{  path: '/' });
     $.removeCookie('gistId', {path: '/'});
}
