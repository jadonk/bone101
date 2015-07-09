function run(ace_editor_id) {
    if (ace_editor_id != -1) {
        editor = ace.edit(ace_editor_id);
        // Clear the console for a clean output
        console.clear();
        var myScript = editor.getSession().getValue();
        myScript = myScript.replace("&lt;", "<");
        myScript = myScript.replace("&gt;", ">");
        myScript = myScript.replace("&amp;", "&");
        myeval(myScript);
    }
}

function mylog() {
    var str = '';
    var area = $('#console-output');
    for (var i in arguments) {
        str += arguments[i].toString() + '\n';
    }
    if (area.length >= 0) {
        area.append(str);
    }
}

function doAlert(m) {
    alert(JSON.stringify(m));
}

function myeval(script) {
    try {
        eval(script);
    } catch (ex) {
        console.log('Exception: ' + ex);
    }
}