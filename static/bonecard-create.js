$( document ).ready( function() {

  var editor = ace.edit("editor0");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");

	// make bonecard list sortable
	$('.sortable').sortable();

	//append new bonecard to the list when clicking on 'add bonecard'
	var bonecard_id = 1;
	var selected_id = 0;

	update_bonecards_list_action();
	update_view_content_action();
	highlight_selected_card(selected_id);


	$('button.add-bonecard').on('click', function(e) {
		e.preventDefault();
		$('ul.bonecards-list').append(bonecard_item(bonecard_id));
		$('.sortable').sortable(); // make the add bonecard sortable
		$('div.view-content').append(bonecard_block(bonecard_id));
		// reinit appended textarea to be ckeditor
		$('div.view-content').find('textarea#editor'+bonecard_id).ckeditor().end();
		
		// apply 'on click' on the new added bonecard
		update_bonecards_list_action();
		update_view_content_action();
	
		editor = ace.edit("editor"+bonecard_id);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
		
		bonecard_id++;
	});

	function update_bonecards_list_action() {
		$('ul.bonecards-list').find('li').each(function(i) {
			var $this = $(this);
			$this.on('click', function() {
				selected_id = $this.attr('id').substring(19);
				highlight_selected_card(selected_id);
				display_selected_card(selected_id);
			});
			$this.find('a').on('click', function(e) {
				e.preventDefault();
				$this.remove();
			})

			$this.mouseenter(function() {
				$this.find('a').show();
			});
			$this.mouseleave(function() {
				$this.find('a').hide();
			});
		});
	}

	function highlight_selected_card(id) {
		$('ul.bonecards-list').find('li').each(function(i) {
			var $this = $(this);
			var $card  = $this.find('.bonecard-micro');
			current_id = $this.attr('id').substring(19);
			if(current_id == id)
				$card.css('box-shadow', '5px 5px 10px #de7224');
			else
				$card.css('box-shadow', '5px 5px 10px #888888');
		});
	}

	function display_selected_card(id) {
		$('div.view-content').children().each(function() {
			$this = $(this);
			current_id = $this.attr('id').substring(14);
			if(current_id == selected_id)
				$this.show();
			else
				$this.hide();
		});
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
			$this.find('input[name=options'+current_id+']:radio')
			.change(function() {
				if($(this).val() == 'html') {
					$this.data('type', 'html');
					$this.find('div.code-card').hide();
					$this.find('div.html-card').show();
				} else {
					$this.data('type', 'code');
					$this.find('div.code-card').show();
					$this.find('div.html-card').hide();
				}
			});

			// get the ckeditor content to the bonecard when clicking on preview
			$this.find('a.bonecard-preview').on('click', function() {
				$this.find('#editor'+selected_id+'-content')
				.html(CKEDITOR.instances['editor'+selected_id].getData());
			});
		});
	}

	function update_micro_bonecard_title(title) {
		$('ul.bonecards-list').find('li').each(function(i) {
			var $this = $(this);
			var $card_title  = $this.find('.bonecard-micro-content');
			current_id = $this.attr('id').substring(19);
			if(current_id == selected_id)
				$card_title.text(title);
		});
	}

 /*
  * this function returns a ready JSON gist format for sending
  *
  *{
  *  description: "title: [tutorial title], description: [tutorial description]",
  *  public: true,
  *  files: {
  *    bone101_[card type]_[card title]: {
  *      content: "String file contents"
  *    }
  *    .
  *    .
  *    .
  *  }
  *}
  */

	function gist_params() {
		tutorial_title = $('input.tutorial-title').val();
		description = $('input.tutorial-description').val();

		var gist_params = {
			description: 'title: '+ tutorial_title + ', description: ' + description,
			public: true
		}
		gist_params['files']= {};

		$('div.view-content').children().each(function() {
			$this = $(this);
			current_id = $this.attr('id').substring(14);

			title = $this.find('input.bonecard-title-input-text').val();

			if($this.data('type') == 'html') {
				gist_params['files']['bone101_html_'+ title] = {};
				gist_params['files']['bone101_html_'+ title]['content'] =
			  CKEDITOR.instances['editor'+current_id].getData();
			} else if($this.data('type') == 'code') {
				editor = ace.edit("editor"+current_id);
				gist_params['files']['bone101_code_'+ title] = {};
				gist_params['files']['bone101_code_'+ title]['content'] =
			  editor.getSession().getValue();
			}
		});
		return JSON.stringify(gist_params);
	}
	
	// html content for adding new bonecard-micro to the list
	function bonecard_item(index) {
		return '<li id="bonecard-micro-item'+index+'" '+
					 'class="bonecards-list-item"><a href = "#" class = '+
					 '"delete-button">x</a><div class="bonecard '+
					 'bonecard-micro"><div class="bonecard-micro-content'+
					 '">untitled bonecard'+index+'</div></div></li>';
	}

	//html content to add new bonecard block for editing
	function bonecard_block(index) {
		// data-type attr could take 'html'(default) or 'code'
		return '<div id="bonecard-block'+index+'"  style="display: none;" '+
					 'data-type="html">'+
					 '<div class="row"><div class="col-md-6"><input'+
					 ' type="text" class="form-control bonecard-title-input-text" id="bonecard-title'+index+'" '+
					 'placeholder="bonecard Title" value=""></div><div class="col-md-3 '+
					 'col-md-offset-3"><div class="btn-group float-right" data-toggle='+
					 '"buttons"><label class="btn btn-default active"><input '+
					 'type="radio" name="options'+index+'" id="option'+index+'-1" autocomplete='+
					 '"off" value="html" checked> HTML</label><label class="btn btn-default">'+
					 '<input type="radio" name="options'+index+'" id="option'+index+'-2" autocomplete='+
					 '"off" value="code" > Code</label></div></div></div></br></br>'+
					 '<div class="code-card"'+ 
					 'style="display: none;"><div class="row"><div'+
					 ' class="col-md-12" ><div class="bonecard-code">'+
					 '<div id="editor'+index+'" class="editor"></div></div></div></div></div>'+
					 '<div class="html-card" role="tabpanel"><ul class="nav nav-tabs"'+
					 ' role="tablist"><li role="presentation" class='+
					 '"active bonecard-write"><a href="#write'+index+'"'+
					 ' aria-controls="write" role="tab" data-toggle'+
					 '="tab">Write</a></li><li role="presentation"><a '+
					 'href="#preview'+index+'" class="bonecard-preview" '+
					 'aria-controls="preview" role="tab" data-toggle='+
					 '"tab">Preview</a></li></ul><div class="tab-content">'+
					 '<div role="tabpanel" class="tab-pane active" id="write'+index+'">'+
					 '<div class="bonecard-editor"><textarea class="ckeditor" '+
					 'cols="80" id="editor'+index+'" name="editor'+index+'" rows="10"></textarea>'+
					 '</div></div><div role="tabpanel" class="tab-pane" id='+
					 '"preview'+index+'"></br><div class="bonecard editor-preview">'+
					 '<div id="editor'+index+'-content" class="editor"></div></div></div></div></div></div>';
	}
});