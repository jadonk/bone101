$(document).ready(init);


function init() {
    if (location.hash) {
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
        if (gistid) {
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
                if (gistid) {
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

    var gist_id = window.location.search.substring(1).substring(8);
    var $slider_for = $('div.slider-for');
    var $slider_nav = $('div.slider-nav');
    tutorial = load_tutorial(gist_id);

    // Initialize slick carousel
    $slider_for.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        asNavFor: '.slider-nav'
    });

    $slider_nav.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.slider-for',
        dots: true,
        centerMode: true,
        focusOnSelect: true
    });

    // change ace_editor_id value with the change of slick slider
    $slider_for.on('afterChange',
        function(event, slick, currentSlide) {
            update_ace_editor_id_val();
        });

    // check if the tutorial is not in the local storage do an ajax request to get & save it
    // then call preview_tutorial function with tutorial data.
    if (tutorial == null) {
        // build ajax request for retrieving the tutorial
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/gists/' + gist_id,
            success: function(data) {
                save_tutorial(gist_id, data, {
                    expires: 1
                });
                preview_tutorial(data);
            },
            error: function(err) {
                console.log(err);
            }
        });
    } else
        preview_tutorial(tutorial);

    function preview_tutorial(tutorial) {
        $('div.ajax-loader').hide();
        Cookies.set('tutorial_owner', tutorial.owner.login, {
            expires: 1,
            path: '/'
        });
        update_cssmenu();

        // Update page title
        description_index = tutorial['description'].indexOf(', description:');
        page_title = tutorial['description'].substring(7, description_index)
        $(document).prop('title', 'BeagleBoard.org - ' + page_title);

        var i = 0;
        bonecard_json = JSON.parse(tutorial.files['bonecard.json'].content);
        $.each(tutorial.files, function(index, val) {
            if (val.filename != '0_bonecard_cover_card' && val.filename != 'bonecard.json') {
                bonecard_info = val.filename.split('_');
                bonecard_index = bonecard_info[0];
                title = bonecard_json.bonecards[bonecard_index - 2].title;
                card_type = bonecard_json.bonecards[bonecard_index - 2].type;
                if (card_type === "code") {
                    $slider_for.slick('slickAdd', bonecard_code_div(val.content, i));
                    ace_init(i);
                } else if (card_type === "html") {
                    $slider_for.slick('slickAdd', bonecard_html_div(val.content));
                }
                $slider_nav.slick('slickAdd', bonecard_mirco_div(title));
                i++;
            }
        });
        update_ace_editor_id_val();
    }

    $('a.fork-tutorial').on('click', function(e) {
        if (Cookies.get('tutorial_owner') != Cookies.get('username')) {
            e.preventDefault();
            $.ajax({
                type: 'POST',
                url: 'https://api.github.com/gists/' + gist_id + '/forks',
                headers: {
                    "Authorization": 'token ' + Cookies.get('token')
                },
                success: function(response) {
                    window.location.replace(base_url + '/Support/bonecard/tutorial?gist_id=' + response.id);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
            gist_params = {
                description: tutorial.description,
                public: true,
                files: tutorial.files
            }

            $.ajax({
                type: 'POST',
                url: 'https://api.github.com/gists',
                data: JSON.stringify(gist_params),
                headers: {
                    "Authorization": 'token ' + Cookies.get('token')
                },
                success: function(response) {
                    window.location.replace(base_url + '/Support/bonecard/tutorial?gist_id=' + response.id);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    });

    function update_cssmenu() {
        // Add 'fork' to cssmenu
        $('ul.main-menu').append(
            '<li class="has-sub">' +
            '  <a class="fork-tutorial" href="#">' +
            '    <span>Fork</span>' +
            '  </a>' +
            '</li>');
        // Add 'edit' to cssmenu
        if (Cookies.get('tutorial_owner') === Cookies.get('username')) {
            $('ul.main-menu').append(
                '<li class="has-sub">' +
                '  <a class="edit-tutorial" href="' + base_url +
                '/Support/bonecard/edit?gist_id=' + gist_id + '">' +
                '    <span>Edit</span>' +
                '  </a>' +
                '</li>');
        }
    }

    function ace_init(index) {
        editor = ace.edit("editor" + index);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
    }

    function bonecard_code_div(content, index) {
        return '<div><div class="bonecard-code"><div id="editor' + index + '"' +
            'class="code" >' + content + '</div></div></div>';
    }

    function bonecard_html_div(content) {
        return '<div><div class="bonecard-zoomed editor-preview"><div ' +
            '>' + content + '</div></div></div>';
    }

    function bonecard_mirco_div(title) {
        return '<div><div class="bonecard bonecard-micro"><div ' +
            'class="bonecard-micro-content"><h2>' + title + '</h2></div></div></div>';
    }
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
    "files": {}
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
    if (auth) {
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