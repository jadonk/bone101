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
                $('a#user').append(me.name);
                user=me.name;
                $.cookie('githubUser', user,{ expires: 1, path: '/' });
                $("a#create").attr("href", "create.html");
                $("a#create").append("Create");
                $("a#login").empty();
                $("a#login").attr("href", "#");
                
                if($.cookie('githubToken')!=null){
            var gisturl = "https://api.github.com/gists";
            var gistrequest = {
                type: "GET",
                url: gisturl,
                success: gistsuccess
            };
            var token = $.cookie('githubToken');
            gistrequest.headers = {
                "Authorization": 'token ' + token
            };
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }
                
            })
        });
        
        
    //};
};

function gistsuccess(response){
     console.log('success: ' + JSON.stringify(response));
}

function gistfail(response) {
    $.removeCookie('gistId', {path: '/'});
    alert("Error creating the tutorial");
}

var logout = function(){
     $.removeCookie('githubUser', user,{ expires: 1, path: '/' });
     $.removeCookie('githubToken', token,{ expires: 1, path: '/' });
}

var createLogin = function(){
    auth.me().done(function(me) {
                $('a#user').append(me.name);
            })
};