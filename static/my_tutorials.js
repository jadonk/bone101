$(document).ready(function() {
    var username = Cookies.get('username');
    var count = 0;
    $tutorials_preview = $('div.tutorials-preview');
    $.ajax({
        type: 'GET',
        url: 'https://api.github.com/users/' + username + '/gists',
        success: function(data) {
            tutorials = [];
            // check for first file in each gist if it has 'bonecard_' then it is
            // a bonecard tutorial
            $.each(data, function(index, val) {
                if (Object.keys(val.files)[0].indexOf('bonecard') > -1) {
                    tutorials.push(val);
                    retrieve_tutorial(val.id);
                }
            });
            // if user didn't sign in redirect to the home page
            if (Cookies.get('token') == null ||
                Cookies.get('name') == null) {
                window.location.replace(base_url + '/');
            }
            // else if no tutorial found append msg to redirect to create page
            else if (tutorials.length == 0) {
                $('div.ajax-loader').hide();
                $tutorials_preview.show();
                $tutorials_preview.append('<div style="text-align: center;height:' +
                    ' 200px;"><h1><b>Couldn&#39;t find any tutorial</b></h1><h2> &nbsp; &nbsp;<a href="' +
                    base_url + '/Support/bonecard/create/">Create your first ' +
                    'tutorial now!</a></h2></div>');
            }
        },
        error: function(err) {
            console.log(err);
        }
    });

    function retrieve_tutorial(gist_id) {

        tutorial = load_tutorial(gist_id);
        if (tutorial == null) {
            // ajax request for retriving each tutorial info (title, description and cover img)
            $.ajax({
                type: 'GET',
                url: 'https://api.github.com/gists/' + gist_id,
                success: function(data) {
                    save_tutorial(gist_id, data, {
                        expires: 1
                    });
                    append_tutorial(data);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
            append_tutorial(tutorial);
        }
    }

    function append_tutorial(tutorial) {
        count++;
        bonecard_json = JSON.parse(tutorial.files['bonecard.json'].content);
        title = bonecard_json.title;
        description = bonecard_json.description;
        img = tutorial.files['0_bonecard_cover_card'].content;
        src = (img == 'default') ? base_url + '/static/images/mascot.png' : img;
        bonecard_preview_div = '<div class="col-md-6 tutorial-card"><a id="' + tutorial.id + '"href = "#"' +
            ' class = "delete-button" onclick="delete_gist(this.id)">x</a><a href="' + base_url + '/Support' +
            '/bonecard/tutorial?gist_id=' + tutorial.id + '"><div class="bonecard"><div style="padding-left: 14px;">' +
            '<img class="cover-card" src="' + src + '" width="300" height="213" />' +
            '<div class="contenthover">' +
            '<h1>' + title + '</h1>' +
            '<p style="color:black;">' + description + '</p>' +
            '</div>' +
            '</div></div></a></div>';
        $tutorials_preview.append(bonecard_preview_div);

        $('.cover-card').contenthover({
            overlay_background: '#fff',
            overlay_opacity: .9
        });

        if (tutorials.length == count) {
            $('div.ajax-loader').hide();
            $tutorials_preview.show();
        }
    }

});

function delete_gist(gist_id) {
    if (confirm("Are you sure you want to delete this Tutorial?")) {
        $.ajax({
            type: 'DELETE',
            url: 'https://api.github.com/gists/' + gist_id,
            headers: {
                "Authorization": 'token ' + Cookies.get('token')
            },
            success: function() {
                document.getElementById(gist_id).parentElement.remove();
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
}