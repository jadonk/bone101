$(document).ready(init);

function init() {
    if(location.hash) {
        console.log(location.hash);
        var gistid = location.hash.substring(1);
        $(".bonecard-list").each(function(index) {
            var list = $(this);
            console.log("Replacing gistid " + list.attr("gistid") +
                        "with " + gistid);
            list.attr("gistid", gistid);
        });
    }
    $(".bonecard-list").each(function(index) {
        var list = $(this);
        var gistid = list.attr("gistid");
        if(gistid) {
            var gisturl = "https://api.github.com/gists/" + gistid;
            var gistrequest = {
                type: "GET",
                url: gisturl,
                success: gistsuccess,
                dataType: "json"
            };
            console.log('request: ' + JSON.stringify(gistrequest));
            $.ajax(gistrequest).fail(gistfail);
        }

        function gistfail(response) {
            console.log('fail: ' + JSON.stringify(response));
        }
        
        function gistsuccess(response) {
            console.log('success: ' + JSON.stringify(response));
            list.replaceWith(response.files["list.html"].content);
            $(".bonecard").each(function(index) {
                console.log('found a bonecard');
                var card = $(this);
                var gistid = card.attr("gistid");
                if(gistid) {
                    var gisturl = "https://api.github.com/gists/" + gistid;
                    var gistrequest = {
                        type: "GET",
                        url: gisturl,
                        success: gistsuccess,
                        dataType: "json"
                    };
                    console.log('request: ' + JSON.stringify(gistrequest));
                    $.ajax(gistrequest).fail(gistfail);
                }        

                function gistsuccess(response) {
                    console.log('success: ' + JSON.stringify(response));
                    card.replaceWith('<div class="bonecard">\n' +
                        response.files["cover.html"].content +
                        '\n</div>'
                    );
                    card.show();
                }
            });
            $('.bonecard').css("cursor", "pointer");       
            $('.bonecard').click(function() {
                // TODO: This isn't the right way to zoom, just a placeholder
                // URL needs to be replaced
                $(this).toggleClass('bonecard-zoomed');
            });
            list.show();
        }
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
}

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
