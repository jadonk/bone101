var editor = ace.edit("editor1");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
ace_editor_id = -1;


//append new bonecard to the list when clicking on 'add bonecard'
var bonecard_id = 2;
var selected_id = 0;
var pre_selected_id = 0;
var cover_img = 'default';
var cards = [];

$(document).ready(function() {

    // make bonecard list sortable
    $('.sortable').sortable();


    // Special case for cover card 'on click' action
    $('#bonecard-micro-item0').on('click', function() {
        pre_selected_id = selected_id;
        selected_id = 0;

        display_selected_card();
        highlight_selected_card();
        update_ace_editor_id();
    });

    // Initialize contenthover
    $('#cover-card').contenthover({
        overlay_background: '#fff',
        overlay_opacity: .9
    });

    // Update tutorial title on cover card
    $('input.tutorial-title').keyup(function() {
        $('#bonecard-block0').find('h1').text($(this).val());
    });

    // Update tutorial description on cover card
    $('input.tutorial-description').keyup(function() {
        $('#bonecard-block0').find('p').text($(this).val());
    });

    $('#cover-card-input').change(function() {
        var filesSelected = document.getElementById("cover-card-input").files;
        if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) {
                cover_img = fileLoadedEvent.target.result;
                img_name = filesSelected[0].name;
                $('#bonecard-block0').find('img').attr('src', fileLoadedEvent.target.result);
            };
            fileReader.readAsDataURL(fileToLoad);
        }
    });


    update_bonecards_list_action();
    update_view_content_action();
    highlight_selected_card();

    $('button.save').on('click', function() {

        if (valid_tutorial()) {

            $.blockUI({
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                }
            });

            var gist_request = {
                type: 'POST',
                url: 'https://api.github.com/gists',
                data: gist_params(),
            }

            gist_request.headers = {
                "Authorization": 'token ' + Cookies.get('token')
            }

            gist_request.success = function(response) {
                save_tutorial(response.id, response, {
                    expires: 1
                });
                $.unblockUI();
                window.location.replace(base_url + '/Support/bonecard/tutorial?gist_id=' + response.id);
            }

            gist_request.error = function(err) {
                console.log(err);
            }

            $.ajax(gist_request);
        }



    });


    $('button.add-bonecard').on('click', function(e) {
        e.preventDefault();

        pre_selected_id = selected_id;
        selected_id = bonecard_id;

        $('ul.bonecards-list').append(bonecard_item(bonecard_id));
        $('.sortable').sortable(); // make the add bonecard sortable
        $('div.view-content').append(bonecard_block(bonecard_id));
        // reinit appended textarea to be ckeditor
        $('div.view-content').find('textarea#editor' + bonecard_id).ckeditor().end();

        // apply 'on click' on the new added bonecard
        update_bonecards_list_action();
        update_view_content_action();

        editor = ace.edit("editor" + bonecard_id);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");

        display_selected_card();
        highlight_selected_card();
        update_ace_editor_id();

        bonecard_id++;
    });
});

function update_bonecards_list_action() {
    $('ul.bonecards-list').find('li').each(function(i) {
        var $this = $(this);
        $this.on('click', function() {
            pre_selected_id = selected_id;
            selected_id = $this.attr('id').substring(19);

            highlight_selected_card();
            display_selected_card();
            update_ace_editor_id();
        });
        $this.find('a').on('click', function(e) {
            e.preventDefault();
            card_id = $this.attr('id').substring(19);
            $('div.view-content').find('#bonecard-block' + card_id).remove();
            $this.remove();
        });
        $this.mouseenter(function() {
            $this.find('a').show();
        });
        $this.mouseleave(function() {
            $this.find('a').hide();
        });
    });
}


function highlight_selected_card() {
    $('#bonecard-micro-item' + pre_selected_id)
        .find('.bonecard-micro').css('box-shadow', '5px 5px 10px #888888');
    $('#bonecard-micro-item' + selected_id)
        .find('.bonecard-micro').css('box-shadow', '5px 5px 10px #de7224');
}


function display_selected_card() {
    $('div#bonecard-block' + pre_selected_id).hide();
    $('div#bonecard-block' + selected_id).show();
}

function update_view_content_action() {
    $('div.view-content').children().each(function() {
        var $this = $(this);
        current_id = $this.attr('id').substring(14);

        // Listen for text input and update bonecard title
        $this.find('input.bonecard-title-input-text').keyup(function() {
            update_micro_bonecard_title($(this).val());
        });

        // Listen for the change in the radio buttons 'html/code'
        $this.find('input[name=options' + current_id + ']:radio')
            .change(function() {
                if ($(this).val() == 'html') {
                    $this.data('type', 'html');
                    $this.find('div.code-card').hide();
                    $this.find('div.html-card').show();
                } else {
                    $this.data('type', 'code');
                    $this.find('div.code-card').show();
                    $this.find('div.html-card').hide();
                }
                update_ace_editor_id();
            });
        // get the ckeditor content to the bonecard when clicking on preview
        $this.find('a.bonecard-preview').on('click', function() {
            $this.find('#editor' + selected_id + '-content')
                .html(CKEDITOR.instances['editor' + selected_id].getData());
        });
    });
}

function update_micro_bonecard_title(title) {
    $('#bonecard-micro-item' + selected_id)
        .find('.bonecard-micro-content').html('<h2>' + title + '</h2');
}


/*
 * this function returns a ready JSON gist format for sending
 *
 *{
 *  description: "[tutorial description]",
 *  public: true,
 *  files: {
 *    0_bonecard_cover_card: {
 *      content: [Base64 encoded img or 'default']
 *    },
 *    [bonecard No.]_bonecard: {
 *      content: "String file contents"
 *    }
 *    .
 *    .
 *    .
 *    bonecard.json: {
 *      content: "{\"description\":\"[tutorial description]\",
                   \"title\":\"[tutorial title]\",
                   \"bonecards\":\"[{"title":"string of card title","type":"html"}]\"}"
 *    }
 *  }
 *}
 */

function gist_params(image) {
    tutorial_title = $('input.tutorial-title').val();
    description = $('input.tutorial-description').val();

    var gist_params = {
        description: description,
        public: true
    }
    gist_params['files'] = {};

    gist_params['files']['0_bonecard_cover_card'] = {};
    gist_params['files']['0_bonecard_cover_card']['content'] = image || cover_img;


    var i = 1;
    $('ul.bonecards-list').find('li').each(function() {

        card_id = $(this).attr('id').substring(19);
        $this = $('div.view-content').find('#bonecard-block' + card_id);

        current_id = $this.attr('id').substring(14);

        title = $this.find('input.bonecard-title-input-text').val();
        gist_params['files'][i + '_bonecard'] = {};

        if ($this.data('type') == 'html') {
            gist_params['files'][i + '_bonecard']['content'] =
                CKEDITOR.instances['editor' + current_id].getData();
            cards.push({
                title: title,
                type: 'html'
            });
        } else if ($this.data('type') == 'code') {
            editor = ace.edit("editor" + current_id);
            gist_params['files'][i + '_bonecard']['content'] =
                editor.getSession().getValue();
            cards.push({
                title: title,
                type: 'code'
            });
        }
        i++;
    });

    bonecard_json = {
        title: tutorial_title,
        description: description,
        bonecards: cards
    }

    gist_params['files']['bonecard.json'] = {};
    gist_params['files']['bonecard.json']['content'] = JSON.stringify(bonecard_json);
    return JSON.stringify(gist_params);
}

function valid_tutorial() {
    is_valid = true;
    // Hide all error msgs
    $('div.errors ul').children().each(function() {
        $(this).hide();
    });

    // Check if the user didn't sign in
    if (Cookies.get('token') == null ||
        Cookies.get('name') == null) {
        $('li.error-login').show()
        is_valid = false;
    }

    // Check if tutorial title is empty
    if ($('input.tutorial-title').val() == '') {
        $('li.error-tutorial-title').show()
        is_valid = false;
    }

    // Check if description is empty
    if ($('input.tutorial-description').val() == '') {
        $('li.error-description').show()
        is_valid = false;
    }

    //Check for card title and its content
    $('div.view-content').children().each(function() {
        $this = $(this);
        current_id = $this.attr('id').substring(14);
        if (current_id != 0) {
            title = $this.find('input.bonecard-title-input-text').val();
            if (title == '') {
                $('li.error-card-title').show()
                is_valid = false;
            }
            if ($this.data('type') == 'html') {
                if (CKEDITOR.instances['editor' + current_id].getData() == '') {
                    $('li.error-html-content').show()
                    is_valid = false;
                }
            } else if ($this.data('type') == 'code') {
                editor = ace.edit("editor" + current_id);
                if (editor.getSession().getValue() == '') {
                    $('li.error-code-content').show()
                    is_valid = false;
                }
            }
        }
    });

    return is_valid;
}

function update_ace_editor_id() {
    $this = $('div.view-content').find('#bonecard-block' + selected_id);
    if ($this.data('type') == 'code') {
        ace_editor_id = 'editor' + selected_id;
    } else
        ace_editor_id = -1;
}


// html content for adding new bonecard-micro to the list
function bonecard_item(index, title) {
    title = title || '<i>Untitled Bonecard</i>'
    return '<li id="bonecard-micro-item' + index + '" ' +
        'class="bonecards-list-item"><a href = "#" class = ' +
        '"delete-button">x</a><div class="' +
        'bonecard-micro"><div class="bonecard-micro-content' +
        '"><h2>' + title + '</h2></div></div></li>';
}

//html content to add new bonecard block for editing
function bonecard_block(index, title, type, content) {
    type = type || 'html';
    html = {
        radio_btn: '',
        style: ''
    }
    code = {
        radio_btn: '',
        style: 'style="display: none;"',
        content: ''
    }

    if (type === 'html') {
        html.radio_btn = 'active';
        html.style = '';
        code.style = 'style="display: none;"';
    } else if (type === 'code') {
        code.radio_btn = 'active';
        html.style = 'style="display: none;"';
        code.style = '';
        code.content = content || '';
    }

    return '<div id="bonecard-block' + index + '"  style="display: none;" ' +
        'data-type="' + type + '">' +
        '<div class="row"><div class="col-md-6"><input' +
        ' type="text" class="form-control bonecard-title-input-text" id="bonecard-title' + index + '" ' +
        'placeholder="bonecard Title" value="' + (title || '') + '"></div><div class="col-md-3 ' +
        'col-md-offset-3"><div class="btn-group float-right" data-toggle=' +
        '"buttons"><label class="btn btn-default ' + html.radio_btn + '"><input ' +
        'type="radio" name="options' + index + '" id="option' + index + '-1" autocomplete=' +
        '"off" value="html" checked> HTML</label><label class="btn btn-default  ' + code.radio_btn + '">' +
        '<input type="radio" name="options' + index + '" id="option' + index + '-2" autocomplete=' +
        '"off" value="code" > Code</label></div></div></div></br></br>' +
        '<div class="code-card" ' + code.style + '><div class="row"><div' +
        ' class="col-md-12" ><div class="bonecard-code">' +
        '<div id="editor' + index + '" class="code">' + code.content + '</div></div></div></div></div>' +
        '<div class="html-card" role="tabpanel" ' + html.style + '><ul class="nav nav-tabs"' +
        ' role="tablist"><li role="presentation" class=' +
        '"active bonecard-write"><a href="#write' + index + '"' +
        ' aria-controls="write" role="tab" data-toggle' +
        '="tab">Write</a></li><li role="presentation"><a ' +
        'href="#preview' + index + '" class="bonecard-preview" ' +
        'aria-controls="preview" role="tab" data-toggle=' +
        '"tab">Preview</a></li></ul><div class="tab-content">' +
        '<div role="tabpanel" class="tab-pane active" id="write' + index + '">' +
        '<div class="bonecard-editor"><textarea class="ckeditor" ' +
        'cols="80" id="editor' + index + '" name="editor' + index + '" rows="10"></textarea>' +
        '</div></div><div role="tabpanel" class="tab-pane" id=' +
        '"preview' + index + '"></br><div class="bonecard-zoomed">' +
        '<div id="editor' + index + '-content"></div></div></div></div></div></div>';
}

function performClick(elemId) {
    var elem = document.getElementById(elemId);
    if (elem && document.createEvent) {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        elem.dispatchEvent(evt);
    }
}