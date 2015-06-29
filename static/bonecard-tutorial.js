$(document).ready(function() {
	
	var gist_id = window.location.search.substring(1).substring(8); 
	var $slider_for = $('div.slider-for');
	var $slider_nav = $('div.slider-nav');

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

	// build ajax request for retrieving the tutorial
	$.ajax({
		type: 'GET',
		url: 'https://api.github.com/gists/' + gist_id,
		success: function(data) {
			$('div.ajax-loader').hide();

			// Update page title
			description_index = data['description'].indexOf(', description:');
			page_title = data['description'].substring(7, description_index)
			$(document).prop('title', 'BeagleBoard.org - ' + page_title);

			var i = 0;
			$.each(data.files, function(index, val) {
				title = val.filename.substring(13);
				card_type = val.filename.substring(8,12);
				if(card_type === "code") {
					$slider_for.slick('slickAdd', bonecard_code_div(val.content, i));
					ace_init(i);
				} else if(card_type === "html") {
					$slider_for.slick('slickAdd', bonecard_html_div(val.content));
				}
				$slider_nav.slick('slickAdd', bonecard_mirco_div(title));
				i++;
			});
		},
		error: function(err) {
			console.log(err);
		}
	});

	function ace_init(index) {
		editor = ace.edit("editor"+index);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
	} 

	function bonecard_code_div(content, index) {
		return '<div><div class="bonecard-code"><div id="editor'+ index +'"'+ 
		'class="editor" >'+ content +'</div></div></div>';
	}
	
	function bonecard_html_div(content) {
		return '<div><div class="bonecard editor-preview"><div '+
		'class="editor">'+ content +'</div></div></div>';
	}

	function bonecard_mirco_div(title) {
		return '<div><div class="bonecard bonecard-micro"><div '+
		'class="bonecard-micro-content wordwrap">'+ title +'</div></div></div>';
	}

});