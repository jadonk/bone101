var edit = true;
$(document).ready(function() {
    var gist_id = window.location.search.substring(1).substring(8);

    if (Cookies.get('tutorial_owner') != Cookies.get('username'))
        window.location.replace(base_url +
            '/Support/bonecard/tutorial?gist_id=' + gist_id);

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

    tutorial = load_tutorial(gist_id);
    $('li#bonecard-micro-item2').remove()
    $('div.view-content').find('#bonecard-block2').remove();

    if (tutorial == null) {
        // build ajax request for retrieving the tutorial
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/gists/' + gist_id,
            success: function(data) {
                if (data.owner.login != Cookies.get('username'))
                    window.location.replace(base_url +
                        '/Support/bonecard/tutorial?gist_id=' + gist_id);
                save_tutorial(gist_id, data, {
                    expires: 1
                });
                load_data(data);
            },
            error: function(err) {
                console.log(err);
            }
        });
    } else
        load_data(tutorial);

    $('button.update').on('click', function() {

        if (valid_tutorial()) {
            image = $('#bonecard-block0').find('img').attr('src');
            image = (image === '/static/images/mascot.png') ? 'default' : image;

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
                type: 'PATCH',
                url: 'https://api.github.com/gists/' + gist_id,
                data: gist_params(image)
            }

            gist_request.headers = {
                "Authorization": 'token ' + Cookies.get('token')
            }

            gist_request.success = function(response) {
                save_tutorial(response.id, response, {
                    expires: 1
                });
                $.unblockUI();
                window.location.replace(base_url +
                    '/Support/bonecard/tutorial?gist_id=' + response.id);
            }

            gist_request.error = function(err) {
                console.log(err);
            }

            $.ajax(gist_request);
        }
    });
});

function load_data(tutorial) {
    bonecard_json = JSON.parse(tutorial.files['bonecard.json'].content);
    console.log(bonecard_json);

    // Set tutorial title
    $('input.tutorial-title').val(bonecard_json.title);
    $('#bonecard-block0').find('h1').text(bonecard_json.title);

    // Set tutorial description
    $('input.tutorial-description').val(bonecard_json.description);
    $('#bonecard-block0').find('p').text(bonecard_json.description);

    for (file in tutorial.files) {
        if (tutorial.files.hasOwnProperty(file)) {
            switch (file) {
                case '0_bonecard_cover_card':
                    image = tutorial.files[file].content;
                    if (image != 'default')
                        $('#bonecard-block0').find('img').attr('src', image);
                    break;

                case 'bonecard.json':
                    break;

                default:
                    card_info = file.split('_');
                    card_id = card_info[0];
                    card_type = bonecard_json.bonecards[card_id - 2].type;
                    card_title = bonecard_json.bonecards[card_id - 2].title;

                    $('ul.bonecards-list')
                        .append(bonecard_item(card_id, card_title));
                    $('div.view-content')
                        .append(bonecard_block(card_id, card_title,
                            card_type, tutorial.files[file].content));
                    update_bonecards_list_action();
                    update_view_content_action();
                    // reinit appended textarea to be ckeditor
                    $('div.view-content').
                    find('textarea#editor' + card_id).ckeditor().end();

                    CKEDITOR.instances['editor' +
                        card_id].setData(tutorial.files[file].content);
                    editor = ace.edit("editor" + card_id);
                    editor.setTheme("ace/theme/monokai");
                    editor.getSession().setMode("ace/mode/javascript");
                    display_selected_card();
                    highlight_selected_card();
                    update_ace_editor_id();
            }
        }
    }

    // make bonecard list sortable
    $('.sortable').sortable();

    $.unblockUI();
}