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

            auth.me().done(function(me) {
                $('a#user').append(me.name);
                $("a#create").attr("href", "create.html");
                $("a#create").append("Create");
            })
        });
    //};
};

var createLogin = function(){
    auth.me().done(function(me) {
                $('a#user').append(me.name);
            })
};