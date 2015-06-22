$( document ).ready(function() {
	var username =  Cookies.get('username');
	$tutorials_preview = $('div.tutorials-preview');

	$.ajax({
		type: 'GET',
		url: 'https://api.github.com/users/'+ username +'/gists',
		success: function(data) {
			$('div.ajax-loader').hide();
			tutorials = [];
			// check for each gist if it start with 'bone101_' then it is
			// a bone101 tutorial
			$.each(data, function(index, val) {
				if(Object.keys(val.files)[0].indexOf('bone101_') > -1) {
					//$tutorials_preview.append(bonecard_preview_div(val));
					description_index =val['description'].indexOf(', description:');
					title = val['description'].substring(7, description_index);
					description = val['description'].substring(description_index+15);

					$tutorials_preview.append(bonecard_preview_div(title, val.id));

					tutorials.push(val);
				}
			});
			// if user didn't sign in redirect to the home page
			if(Cookies.get('token') == null ||
		 		 Cookies.get('name') == null) {
				window.location.replace( base_url + '/');
		 	} 
			// else if no tutorial found append msg to redirect to create page
			else if(tutorials.length == 0)
				$tutorials_preview.append('<div style="text-align: center;height:'+
					' 200px;"><h1><b>Couldn&#39;t find any tutorial</b></h1><h2> &nbsp; &nbsp;<a href="'+
					base_url + '/Support/bone101/create.html">Create your first '+
					'tutorial now!</a></h2></div>');

		},
		error: function(err) {
			console.log(err);
		}
	});
	
	function bonecard_preview_div(title, gist_id) {
		return '<div class="col-md-4"><a href="'+ base_url +'/Support'+
					 '/bone101/tutorial.html?gist_id='+ gist_id 
					 +'"><div class="bonecard bonecard-preview"'+
					 ' style=" margin-bottom: 20px; "><div class="'+
					 'bonecard-preview-content wordwrap"><b>'+ title 
					 +'</b></div></div></a></div>';
	}
});
