---
layout: bare
---
bonescriptStaticPath = typeof bonescriptStaticPath == 'undefined' ? '{{site.baseurl}}/static/' : bonescriptStaticPath;

var cssUrls = [
    'jquery.terminal.css',         // http://terminal.jcubic.pl/js/jquery.terminal.css
    'jquery-ui.css',               // http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css
    'client.css'
];

var scriptUrls = [
    'jquery.js',
    'jquery.dimensions.js',
    'jquery.ui.core.js',
    'jquery.ui.widget.js',
    'jquery.ui.accordion.js',
    'jquery.svg.js',
    'jquery.terminal.js',          // http://terminal.jcubic.pl/js/jquery.terminal-0.4.12.min.js
    'jquery.mousewheel.js',        // http://terminal.jcubic.pl/js/jquery.mousewheel-min.js
    'jquery-ui.min.js',            // http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.min.js
    'bonescript.js',
    'beagle-ui.js',
    'ajaxorg-ace-builds-c2f3abb/ace.js'// https://github.com/ajaxorg/ace-builds/commit/c2f3abb2ecd3287f90225d804132f0fd26cfb639
];

var oldLog = console.log;
console.log = mylog;
loadCss();

function mylog() {
    var str = '';
    var area = $('#console-output');
    for(var i in arguments) {
        str += arguments[i].toString() + '\n';
    }
    oldLog.apply(console, arguments);
    if(area.length) {
        area.append(str);
        area.scrollTop(area[0].scrollHeight - area.height());
    }
}

function loadCss() {
    var url = cssUrls.shift();
    if(url) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = bonescriptStaticPath + url;
        var linkObj = head.appendChild(link);
        loadCss();
    } else {
        loadScripts();
    }
}

// based loosely on http://stackoverflow.com/questions/950087/include-javascript-file-inside-javascript-file
function loadScripts() {
    var url = scriptUrls.shift();
    if(url) {
        loadScript(url, loadScripts);
    } else {
        initClient();
    }
}

function loadScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = bonescriptStaticPath + url;
    script.charset = 'UTF-8';
    var scriptObj = head.appendChild(script);
    scriptObj.onload = callback;
}

function initClient() {
    $('.use-editor').each(demoEdit);
    var co_style = $('#console-output').attr('style');
    $('#console-output').replaceWith('<textarea id="console-output" />')
    $('#console-output').attr('style', co_style);

    function demoEdit(index) {
        if(typeof editor == 'undefined') editor = {};
        editor[this.id] = {};
        editor[this.id].original = this.innerHTML;
        editor[this.id].editor = ace.edit(this.id);
        editor[this.id].editor.setTheme("ace/theme/textmate");
        if($(this).attr('syntax') == 'sh') 
            editor[this.id].editor.getSession().setMode("ace/mode/sh");
        else editor[this.id].editor.getSession().setMode("ace/mode/javascript");
        var originalDemoRun = demoRun;
        demoRun = function(myid) {
            if(typeof editor[myid].editor != 'undefined') {
                var code = editor[myid].editor.getValue();
                myeval(code);
            } else {
                originalDemoRun(myid);
            }
        }
        var originalShellRun = shellRun;
        shellRun = function(myid) {
            if(typeof editor[myid].editor != 'undefined') {
                var code = editor[myid].editor.getValue();
                myShell(code);
            } else {
                originalShellRun(myid);
            }
        }
    }
}

function doAlert(m) {
    alert(JSON.stringify(m));
}

function demoRun(id) {
    var myScript = document.getElementById(id).innerHTML;
    myScript = myScript.replace("&lt;", "<");
    myScript = myScript.replace("&gt;", ">");
    myScript = myScript.replace("&amp;", "&");
    return(myeval(myScript));
}

function onShell(x) {
    console.log(x);
}

function myShell(code) {
    var b = require('bonescript');
    b.socket.on('shell', onShell);
    b.socket.emit('shell', code);
}

function shellRun(id) {
    var myScript = document.getElementById(id).innerHTML;
    myShell(myScript);
}

function demoRestore(id) {
    if(typeof editor[id] == 'undefined') return;
    editor[id].editor.setValue(editor[id].original);
}

function myeval(script) {
    try {
        eval(script);
    } catch(ex) {
        console.log('Exception: ' + ex);
    }
}
