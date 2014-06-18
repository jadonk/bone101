$(".bonecard-list .bonecard").each(function(index) {
    var item = $(this);
    var anchor = item.find("a").first();
    var gistid = anchor.attr("gistid");
    var gisturl = "https://api.github.com/gists/" + gistid;
    var gistrequest = {
        type: "GET",
        url: gisturl,
        success: gistsuccess,
        dataType: "json"
    };
    console.log('request: ' + JSON.stringify(gistrequest));
    $.ajax(gistrequest).fail(gistfail);
    
    function gistsuccess(response) {
        console.log('success: ' + JSON.stringify(response));
        anchor.replaceWith(response.files["cover.html"].content);
        item.show();
    }
    
    function gistfail(response) {
        console.log('fail: ' + JSON.stringify(response));
    }
});
$('.bonecard').css("cursor", "pointer");

// TODO: This isn't the right way to zoom, just a placeholder
// URL needs to be replaced
$('.bonecard').click(function() {
    $(this).toggleClass('bonecard-zoomed');
});

OAuth.initialize('t4Qxz2lcwB10Qgz_iXZwNjsZ1w4');

$('#connect').click(function() {
    OAuth.popup('github', function(err, result) {
        console.log(err);
        auth = result;
    });
});

$('#edit').click(function() {
    $.getScript('http://mindmup.github.io/bootstrap-wysiwyg/external/jquery.hotkeys.js', loadWysiwyg);
});

function loadWysiwyg() {
    $.getScript('http://mindmup.github.io/bootstrap-wysiwyg/bootstrap-wysiwyg.js', enableEdit);
}

function enableEdit() {
    $('#editor').wysiwyg();
}

var gistData = {
    "description": "Bonecard tutorial",
    "public": true,
    "files": {
    }
};

function makeGist() {
    var url = "https://api.github.com/gists";
    gistData.files["bonecard.html"] = {
        "content": $('#editor').cleanHtml()
    };
    var mypost = {
        type: "POST",
        url: url,
        data: JSON.stringify(s.testData),
        success: onsuccess,
        dataType: "json"
    };
    if(auth) {
        mypost.headers = {
            "Authorization": 'token ' + auth.access_token
        };
    }
    console.log("Doing post: " + JSON.stringify(mypost));
    $.ajax(mypost).fail(onfail);
    
    function onsuccess(response) {
        console.log('success: ' + JSON.stringify(response));
    }
    
    function onfail(response) {
        console.log('fail: ' + JSON.stringify(response));
    }
};
