window.onload = function() {
	if(Cookies.get('token') != null ||
		 Cookies.get('name') != null) {
		$('input.btn1.github-login').hide();
		$login_ul = $('div.github-login ul.github-login-ul');
    $login_ul.show();
    $login_ul.find('span.username').html(name);
	}

	OAuth.initialize('N46nTD88b9rs7E-K0FUAqt8JUi0');
	$('input.btn1.github-login').on('click', function() {
		$this = $(this);
		OAuth.popup('github', function(err, rslt) {
		    access_token = rslt.access_token;
		    Cookies.set('token', access_token, { expires: 1, path: '/'});
		    rslt.me().done(function(me) {    
    		    name = me.name;                
		        username = me.alias; 
		        email = me.email;
		    		Cookies.set('name', name, { expires: 1, path: '/'});
		    		Cookies.set('username', username, { expires: 1, path: '/'});
		        $this.hide();
		        $login_ul = $('div.github-login ul.github-login-ul');
		        $login_ul.show();
		        $login_ul.find('span.username').html(name);
		    })
		});
	});

	$('a.github-logout').on('click', function(e) {
		e.preventDefault();
		Cookies.remove('token');
		Cookies.remove('name');
		Cookies.remove('username');
		$login_ul = $('div.github-login ul.github-login-ul');
    $login_ul.hide();
    $login_ul.find('span.username').html("");
		$('input.btn1.github-login').show();
	});
}