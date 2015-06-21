$(document).ready(function() {
	
	var gist_id = window.location.search.substring(1).substring(8); 
	var $slider_for = $('div.slider-for');
	var $slider_nav = $('div.slider-nav');

	$.ajax({
		type: 'GET',
		url: 'https://api.github.com/gists/' + gist_id,
		success: function(data) {
			var i = 0;
			$.each(data.files, function(index, val) {
				title = val.filename.substring(13);
				card_type = val.filename.substring(8,12);
				if(card_type === "code") {
					$slider_for.append(bonecard_code_div(val.content, i));
					console.log(bonecard_code_div(val.content, i));
					ace_init(i);
				} else if(card_type === "html") {
					$slider_for.append(bonecard_html_div(val.content));
				}
				$slider_nav.append(bonecard_mirco_div(title));
				i++;
			});
			slick_init();
		},
		error: function(err) {
			console.log(err);
		}
	});

	function slick_init() {
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
	}

	function ace_init(index) {
		var editor = ace.edit("editor"+index);
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