/**
 * Provide a visual rendering of the microformats in the page.
 *
 * @author <a href="mailto:fianno@jshub.org">Fiann O'Hagan</a>
 */
(function() {


  var highlightMicroformats = function() {
  	var count = 0;
	
	// handler for the highlighting on/off switch
    var doHighlight = function() {
      if (this.selected) {
        this.selected = false;
        $(this.source).add($(this.source).children())
		  .animate({
            backgroundColor: 'white'
          }, 1000);
        $(this).text('off');
      } else {
        this.selected = true;
        $(this.source).add($(this.source).children())
		  .css('backgroundColor', 'white') // safari doesn't find transparent
		  .animate({
            backgroundColor: '#FFFF88'
          }, 1000);
        $(this).text('on');
      }
    };
  	
	// create a textarea containing the source of each microformat node
    $('.hpage, .hproduct, .hauthentication, .hpurchase').each(function() {
      var microformats = $('#microformats');
	  var html = $(this).html().replace(/\n\s*\n/g, '\n');
	  var className = $(this).attr('className');
	  /\bh(\w)(\w+)/.test(className);
	  var mfName = 'h' + RegExp.$1.toUpperCase() + RegExp.$2;
      microformats.append('<h2>' + mfName + ' microformat node</h2>');
	  var highlightHtml = $('<p>Highlight (<a>off</a>)</p>');
	  $(this).prepend('<a name="mf-anchor-'+(++count)+'"></a>');
	  $('a', highlightHtml).click(doHighlight)
	    .attr('href', '#mf-anchor-'+count)
		.get(0).source = this;
      $('#microformats').append(highlightHtml);
	  var syntaxHtml = '<textarea name="code" class="html" cols="60" rows="1">' +
        '<div class="' + className + '">\n' + html +
        '\n</div></textarea>';
      $('#microformats').append(syntaxHtml);
	  
    });
	// use Yahoo's syntax highlighter to show the code
    dp.SyntaxHighlighter.HighlightAll('code');
    // then highlight the class attributes in the visible code
	$('.dp-highlighter .attribute').each(function() {
      var node = $(this);
      if (node.text() === 'class') {
	    node = node.add(node.next()); // =
	    node = node.add(node.next()); // value
	    node.wrapAll('<span class="highlight" title="Microformat property"></span>');
      } else if (node.text() === 'rel') {
	    node = node.add(node.next()); // =
	    node = node.add(node.next()); // "tag"
	    node.wrapAll('<span class="highlight" title="Microformat rel-tag reference"></span>');
      }
    });
  };
  
  $(document).ready(highlightMicroformats);
  
})();
