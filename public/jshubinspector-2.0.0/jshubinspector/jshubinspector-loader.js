/*!
 *  jsHub open source tag
 *
 *  Loads the files for the Inspector. Note we are currently using the Get utility not the
 *  YUI Loader, because we need synchronous loading to ensure initial page view events are 
 *  not missed.
 *
 *  Copyright (c) 2009 jsHub.org
 *  Author: Fiann O'Hagan fianno@jshub.org
 */

(function(){
  // Wrap logging during development
  function log(){ 
    if (window.console) {
      console.log.apply(console, arguments); 
    }
  };

  // Load other files from a path relative to this file
  var scripts = document.getElementsByTagName('script'), 
      baseURL = scripts[scripts.length - 1].getAttribute('src');
  baseURL = baseURL.substring(0, baseURL.indexOf('/jshubinspector/')) + "/";
  
  // Get the CSS files
  var cssFiles = [
    baseURL + 'container/assets/skins/sam/container.css',
    baseURL + 'resize/assets/skins/sam/resize.css',
    baseURL + 'yui3-cssreset/reset-context-min.css',
    baseURL + 'yui3-cssbase/base-context-min.css',
    baseURL + 'yui3-cssfonts/fonts-context-min.css',
    baseURL + 'yui3-cssgrids/grids-context-min.css',
    baseURL + 'accordionview/accordionview-min.css',
    baseURL + 'jshubinspector/jshubinspector.css'
  ];
  YAHOO.util.Get.css(cssFiles);
  
  // Get the JavaScript
  var jsFiles = [
    baseURL + 'utilities/utilities.js',
    baseURL + 'container/container-min.js',
    baseURL + 'resize/resize-min.js',
    baseURL + 'accordionview/accordionview-min.js',
    baseURL + 'json2/json2.js',
    baseURL + 'sha1/sha1.js',
    baseURL + 'jshubinspector/jshubinspector.js',
    baseURL + 'jshubinspector/jshubinspector-init.js'
  ]
  
  // load the modules
  YAHOO.util.Get.script(jsFiles, {
    onFailure: function(msg){ 
      log('Inspector load failed: '+ msg); 
    }
	});
})();