/*!
 *  jsHub open source tag
 *  Copyright (c) 2009 jsHub.org
 *  Author: Liam Clancy <liamc@jshub.org>
 */

(function(){

  // Wrap logging during development
  function log(){ 
    if (window.console) {
      console.log.apply(console, arguments); 
    }
  };
  
  // Create an Inspector instance from Global object
  var oInspector = new YAHOO.JSHUB_ORG.Inspector('jshub_inspector', {
    width: '265px',  // TODO: this should be dependent on state
    //height: '', // do not use as it breakes the resizing
    close: true, // default true
    draggable: true, // default true
    dragOnly: true, // default false
    autofillheight: "body", // default body
    constraintoviewport: true,
    underlay: "none", //default none
    state: 1, // set state on creation (default 1)
    status: "info" // set status on creation (default info)
  });
  
  
  // Enhancements to Inspector Events for this instance
  /*
  Inspector.beforeRenderEvent.subscribe(function() {
    log('beforeRenderEvent called on instance');
  })
  
  // Enhancements to Inspector Events
  Inspector.renderEvent.subscribe(function() {
    log('renderEvent called on instance');
  })
  */
  
  // Public API
  window.jsHub = window.jsHub || {};
  window.jsHub.Inspector = oInspector;  
  // Enable inspection of the instance
  log("jsHub Inspector initialized: %o", window.jsHub.Inspector);

})();

// autmoatically show the Inspector
YAHOO.util.Event.on(window, 'load', function(){
  jsHub.Inspector.render();
  jsHub.Inspector.show();
});