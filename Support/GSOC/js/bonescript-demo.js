//var oldLog = console.log;
//console.log = mylog;


function mylog() {
    var str = '';
    var area = $('#console-output');
    for(var i in arguments) {
        str += arguments[i].toString() + '\n';
    }
    //oldLog.apply(console, arguments);
    if(area.length >= 0) {
        area.append(str);
        //area.scrollTop(area[0].scrollHeight - area.height());
    }
}


function doAlert(m) {
    alert(JSON.stringify(m));
}

function demoRun(code) {
    
    var myScript = code//document.getElementById(id).innerHTML;
    myScript = myScript.replace("&lt;", "<");
    myScript = myScript.replace("&gt;", ">");
    myScript = myScript.replace("&amp;", "&");
    myeval(myScript);
}



function myeval(script) {
    try {
        eval(script);
    } catch(ex) {
        console.log('Exception: ' + ex);
    }
}
