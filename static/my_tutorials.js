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
                if (Object.keys(val.files)[0].indexOf('bonecard_') > -1) {
                    description_index = val['description'].indexOf(', description:');
                    title = val['description'].substring(7, description_index);
                    description = val['description'].substring(description_index + 15);
                    append_tutorial(title, description, val.id);
                    tutorials.push(val);
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

    function append_tutorial(title, description, gist_id) {
        // ajax request for retriving each tutorial cover
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/gists/' + gist_id,
            success: function(data) {
                Cookies.set(gist_id, data, {
                    expires: 1,
                    path: '/'
                });
                count++;
                img = data.files['0_bonecard_cover_card'].content;
                src = (img == 'default') ? base_url + '/static/images/logo.png' : img;
                bonecard_preview_div = '<div class="col-md-6"><a href="' + base_url + '/Support' +
                    '/bonecard/tutorial?gist_id=' + gist_id + '"><div class="bonecard"><div style="padding-left: 14px;">' +
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
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
});