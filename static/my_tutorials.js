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

			console.log(tutorials);
		},
		error: function(err) {
			console.log(err);
		}
	});
	
	function bonecard_preview_div(title, gist_id) {
		return '<div class="col-md-4"><a href="/Support'+
					 '/bone101/tutorial.html?gist_id='+ gist_id 
					 +'"><div class="bonecard bonecard-preview"'+
					 ' style=" margin-bottom: 20px; "><div class="'+
					 'bonecard-preview-content wordwrap"><b>'+ title 
					 +'</b></div></div></a></div>';
	}
});
