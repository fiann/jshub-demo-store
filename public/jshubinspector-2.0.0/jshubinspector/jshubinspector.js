/*!
 *  jsHub open source tag
 *  Copyright (c) 2009 jsHub.org
 *  Author: Liam Clancy <liamc@jshub.org>
 *  Prototype: Liam Clancy, Fiann O'Hagan, Steve Heron
 */

(function(){

  /**
  * Utility functions
  */ 
  // Wrap logging during development
  function log(){ 
    if (window.console && META.DEBUG === true) {
      console.log.apply(console, arguments); 
    }
  };
  
  // Simple string formatter
  // Usage: format('Some string: {0} {1}', 'foo', 'bar') returns: "Some string: foo bar"
  function format(){
    // coerce arguments to a proper Array
    var args =  Array.prototype.slice.call(arguments, 0);
    log('Formatting: %o', args);
    // Get the string to format leaving only the tokens in the array
    var string = args.shift();
    var pattern = /\{\d+\}/g;
    var result = string.replace(pattern, function(token){
        var text = args[token.match(/\d+/)]; 
        log('Formatting token: %o, text: %o', token, text);    
        return text;
      });
    log('Formatting result: %o', result);    
    return result;
  };

  // humanize a string
  function humanize(text) {
    log("Humanize text: %o", text)
    // some microformats use 'n' for name e.g. product name
    if (text === 'n') { 
      text = 'name'; 
    }
    return text.substring(0, 1).toUpperCase() + text.substring(1).replace(/-/g, " ");
  };

  /**
   * The jsHub Inspector provides a visible UI for the inspection of data and events 
   * collected by the jsHub core tag. See http://jshub.org/ for more details.
   * @module jshubinspector
   * @requires utilities container resize accordionview json2 sha1
   */
 
  // YUI Library shortcuts
  var Lang = YAHOO.lang
      Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CustomEvent = YAHOO.util.CustomEvent,
      Element = YAHOO.util.Element,
      Module = YAHOO.widget.Module,
      Panel = YAHOO.widget.Panel,
      AccordionView = YAHOO.widget.AccordionView,
      Resize = YAHOO.util.Resize,
      UA = YAHOO.env.ua;   

  /**
  * Inspector is an implementation of Panel with custom rendering of data added 
  * to an Accordion from events fired by the jsHub.org core tag (and more).
  * @namespace YAHOO.JSHUB_ORG
  * @class Inspector
  * @extends YAHOO.widget.Panel
  * @constructor
  * @param {String} el The element ID representing the Inspector <em>OR</em>
  * @param {HTMLElement} el The element representing the Inspector
  * @param {Object} userConfig The configuration object literal containing 
  * the configuration that should be set for this Inspector. See configuration 
  * documentation for more details.  
  */
  var Inspector = function(id, oConfigs){
  
    // Widget constructor
    Inspector.superclass.constructor.call(this, id || Dom.generateId(), oConfigs);
  } 
  
  /**
  * Constant representing the Inspector's metadata properties
  * @property META
  * @private
  * @final
  * @type Object
  */   
  var META = {
        "NAME": 'jsHub.org Inspector',
        "VERSION": '2.0',
        "BUILD": '001',
        "DEBUG": false // enable debugging and logging
      };
 
  /**
  * Constant representing the name of the Inspector's YUI events
  * @property EVENT_TYPES
  * @private
  * @final
  * @type Object
  */
  var EVENT_TYPES = {
        "IE_REPAINT": "ieRepaint",
        "FOUND_CODE": "foundCode",
        "CHECKSUM_CODE": "checksumCode",
        "CHANGE_STATE": "changeState",
        "CHANGE_STATUS": "changeStatus",
        "NEW_HUB_EVENT": "newHubEvent",
        "RENDER_HUB_EVENT": "renderHubEvent"
      };
        
  /**
  * Constant representing the Inspector's YUI configuration properties
  * @property DEFAULT_CONFIG
  * @private
  * @final
  * @type Object
  */  
  var DEFAULT_CONFIG = {
        "STATE": {
          key: "state",
          value: 1,
          validator: Lang.isNumber
        },
        "STATUS": {
          key: "status",
          value: "info",
          validator: Lang.isString
        },
        "STRINGS" : {
          key: "strings",
          validator: Lang.isObject,
          value: {
            "header_text": 'Activity Inspector',
            "footer_text": 'Inspector v' + META.VERSION + ' r' + META.BUILD,
            "close": 'Close',
            "success_message": 'Installed &amp; active',
            "warning_message": 'Active with warnings',
            "info_message": 'Not installed',
            "error_message": 'Having problems'
          }
        }        
      };

  // Other properties
  
  /**
  * Constant holder for references to related/nested components, 
  * e.g. Content Modules, AccordionViews, Resizers, etc 
  * @property COMPONENTS
  * @private
  * @final
  * @type Object  
  */
  var COMPONENTS = {}

  /**
  * Constant holder for template HTML 
  * TODO: Move more of these into STRINGS for use with format()
  * @property TEMPLATES
  * @private
  * @final
  * @type Object  
  */
  var TEMPLATES = {
          'LAUNCHER': '<ul class="launcher"><li class="status">&nbsp;</li></ul>',
          'PANEL_HEADER': '<span class="title">{0}</span>',
          'PANEL_FOOTER': '<div class="version">{0}</div><div class="logo"></div>',
          'STATUS_PREFIX': '<p class="self">jsHub is</p>',
          'STATUS_MESSAGE': '<p class="message">{0}</p>',
          'SEARCH': '<div class="yui-u first"><label class="search" for="inspector_search">Find</label></div><div class="yui-u"><input type="text" disabled="disabled" class="search" id="inspector_search"/></div>',
          'LARGE_BUTTON': '<a href="#" class="jshub-button events">View Events</a><a href="http://www.jshub.org/" class="jshub-button get">Get jsHub</a>',
          'SMALL_BUTTON': '<a href="#" class="jshub-button">Hide Events</a>',
          'HUB_EVENT_SEPARATOR': '<hr class="event-separator"/>',
          'PANEL_DEFAULT_CONTENT': '<p class="default-content">No data</p>'
        }  

  /**
  * Constant representing the Inspector's AccordionView Panels
  * @property PANELS
  * @private
  * @final
  * @type Array
  */ 
  var PANELS = {
        /* 
          "tagging-issues": {
          label: 'Tag status',
          content: '<!-- ready to recieve data -->',
          template: '<div title="Tag status report" class="yui-g help-text event-header">{0}</div><div class="message {1}"><ul><li>{2}</li></ul></div><div class="message">{3}</div>'
        },
        */
        "page": {
          label: 'Page events',
          content: TEMPLATES.PANEL_DEFAULT_CONTENT,
          template_variable: '<div title="No help text available" class="yui-g help-text"><p class="variable">{0}</p></div>',
          template_value: '<div class="yui-gd duplicate"><div class="yui-u first"><p class="vendor">{0}:</p></div><div class="yui-u"><p class="value">{1}</p></div></div>'
        },
        "user-interactions": {
          label: 'Ecommerce events',
          content: TEMPLATES.PANEL_DEFAULT_CONTENT,
          template_variable: '<div title="No help text available" class="yui-g help-text"><p class="variable">{0}</p></div>',
          template_value: '<div class="yui-gd duplicate"><div class="yui-u first"><p class="vendor">{0}:</p></div><div class="yui-u"><p class="value">{1}</p></div></div>'
        },
        "data-sources": {
          label: 'Data sources',
          content: TEMPLATES.PANEL_DEFAULT_CONTENT,
          template: '<div title="Data source" class="yui-g help-text event-header">{0}</div><div class="message info"><ul><li>{1} plugin</li></ul></div><div class="yui-gd"><div class="yui-u first"><p class="variable">Vendor:</p></div><div class="yui-u"><p class="value">{2}</p></div></div><div class="yui-gd"><div class="yui-u first"><p class="variable">Version:</p></div><div class="yui-u"><p class="value">{3}</p></div></div>',
          template_microformat: ''
        },
        "inline-content-updates": {
          label: 'Inline content updates',
          content: TEMPLATES.PANEL_DEFAULT_CONTENT,
          template_variable: '',
          template_value: ''
        }
      };  

  /**
  * Constant representing the mapping of jsHub events to AccordionView Panels for display
  * "jsHub event string Id": "Inspector panel string Id in PANELS"
  * TODO: use these in receivedHubEvent
  * @property PANEL_MAPPINGS
  * @private
  * @final
  * @type Object
  */ 
  var EVENT_PANEL_MAPPINGS = {
        "data-capture-start": "page",
        "data-capture-complete": "page",
        "form-transport-complete": "page",
        "page-view": "page",
        "authentication": "user-interactions",
        "product-view": "user-interactions",
        "product-purchase": "user-interactions",
        "cart-add": "user-interactions",
        "cart-remove": "user-interactions",
        "cart-update": "user-interactions",
        "checkout": "user-interactions",
        "duplicate-value-warning": "tagging-issues"
      };
  
  /**
  * Constant representing the default ID used for an Inspector's 
  * wrapping container
  * @property Inspector.ID_CONTAINER
  * @static
  * @final
  * @type String
  */
  Inspector.ID_CONTAINER = "jshub_inspector_container";
  
  /**
  * Constant representing the prefix used for an Inspector's state CSS class
  * in combination with the DEFAULT_CONFIG.STATE property
  * @property Inspector.CSS_STATE_PREFIX
  * @static
  * @final
  * @type String
  */
  Inspector.CSS_STATE_PREFIX = "state";

  /**
  * Constant representing the default ID used for an Inspector's nested 
  * AccordionView instance
  * @property Inspector.ID_ACCORDION
  * @static
  * @final
  * @type String
  */
  Inspector.ID_ACCORDION = "event_list"

  // Private methods - pass 'me' to be able to access Inspector as 'this'

  /** 
  * find all the Accordion panel(s) content areas
  * This is dependent on the DOM structure of the Accordion staying as UL>LI>A+DIV
  * TODO: use CSS selectors with COMPONENTS.event_list.CLASSES.CONTENT, rather than DOM methods
  * @method getAllAccordionPanelContent
  * @private
  */
  function getAllAccordionPanelContent() {
    var aPanels = COMPONENTS.event_list.getPanels();
    var aPanelContent = [];
    for (var i = 0; i < aPanels.length; i++) {
      eContent = Dom.getLastChild(aPanels[i]);
      aPanelContent.push(eContent);
    }
    // TODO: if only 1 element act like jQuery?
    return aPanelContent;
  };
  
  /** 
  * find the Accordion open/active panel(s) content area
  * This is dependent on the DOM structure of the Accordion staying as UL>LI>A+DIV
  * TODO: use CSS selectors and COMPONENTS.event_list.CLASSES.TOGGLE && CONTENT, rather than DOM methods
  * @method getActiveAccordionPanelContent
  * @private
  */
  function getActiveAccordionPanelContent() {
    var aPanels = COMPONENTS.event_list.getPanels();
    var aPanelContent = [];
    for (var i = 0; i < aPanels.length; i++) {
      var eToggle = Dom.getFirstChild(aPanels[i]);
      if (Dom.hasClass(eToggle, COMPONENTS.event_list.CLASSES.ACTIVE)) {
        eContent = Dom.getLastChild(aPanels[i]);
        aPanelContent.push(eContent);
      }
    }
    // TODO: if only 1 element act like jQuery?
    return aPanelContent;
  };  

  /** 
  * "init" method. Creates the Accordion in an element in the the body of a hidden Module 
  * so that we can add Hub Events whilst the Inspector is hidden
  */  
  function createEventList(me) {
    // Check we haven't already added this
    if (COMPONENTS.event_list) {
      log('AccordionView already created: %o', COMPONENTS.event_list);
      return false;
    }

    // Create a hidden Module for the AccordionView to be added to (state3)
    var mEventlistModule = new Module("mEventlistModule");
    mEventlistModule.setBody('<div id="'+ Inspector.ID_ACCORDION +'"></div>');
    COMPONENTS.mEventlistModule = mEventlistModule;
    log("Content: mEventlistModule: %o", mEventlistModule);
    
    // Create the AccordionView and manipulate before rendering/appending
    // TODO: subclass AccordionView to add our own methods for convenience
    var oEventList = new YAHOO.widget.AccordionView('memory', {
      width: '100%',
      collapsible: true,
      expandable: false,
      animate: false
    });
    
    // generate AccordionView panels from PANELS config
    var panelIndex = -1;
    for (var panelId in PANELS) {
      oEventList.addPanel(PANELS[panelId]);
      
      panelIndex ++;
      log('AccordionView Panel: %o, index: %o', PANELS[panelId], panelIndex);
      // add a CSS class to the panel for use to render Hub Events
      // This is found by panelIndex since the AccordionView API addPanel() returns void
      var newPanel = oEventList.getPanel(panelIndex);
      Dom.addClass(newPanel, "event-section empty " + panelId);
      log('AccordionView Panel: %o, CSS: %o', panelIndex, panelId);
    };
    // Uncomment to start with a panel open
    //oEventList.openPanel(0);

    // replace default indicator with a count of child elements and initialise with 0
    var indicators = Dom.getElementsByClassName('indicator', 'span', oEventList._configs.element.value, function (el){
          Dom.replaceClass(el, 'indicator', 'count');
          el.innerHTML = '0';
        });
    log('AccordionView Panel: Converted all indicators to counts: %o', indicators);

    // subscribe to events to get info for resizing
    oEventList.subscribe('stateChanged', function() {
      log('Accordion Custom event: type: stateChanged, arguments: %o, this: %o', arguments, this);
      log('Accordion Custom event: firing ieRepaintEvent with id: %o', 'event_list');
      me.ieRepaintEvent.fire(Inspector.ID_ACCORDION);
    });
    oEventList.subscribe('afterPanelClose', function() {log('Accordion Custom event: type: afterPanelClose, arguments: %o, this: %o', arguments, this)});
    oEventList.subscribe('afterPanelOpen', function() {log('Accordion Custom event: type: afterPanelOpen, arguments: %o, this: %o', arguments, this)});
    
    // expose for later access, e.g. resizing
    COMPONENTS.event_list = oEventList;
    log('Created an AccordionView: %o', COMPONENTS.event_list);
  };
  
  /**
  * "init" method. See if a jsHub core lib is present, bind to it and add a class to indicate the jsHub core state in the UI
  * @method jsHubIsPresent
  * @private
  */
  function jsHubIsPresent(me) {
    var isPresent = false;
    if (window.jsHub && window.jsHub.bind) {
      isPresent = true;
      log("jsHubIsPresent: %o, jsHub: %o, me: %o", isPresent, window.jsHub, me);
      // listen out for Hub events
      jsHub.bind("*", {
        id : "inspector",
        type : "data-transport",
        eventHandler : function(name, data) {
          log("jsHub.bind firing newHubEvent: name: %o, data: %o, me: %o, this: %o", name, data, me, this);
          me.newHubEvent.fire(name, data);
        }
      });
      // jHub core lib is present
      // Note: actual CSS change made by cfg.status event handler
      me.cfg.queueProperty('status', 'success');
      // notify that the jsHub core lib is available
      log("jsHubIsPresent: firing foundCodeEvent: jsHub: %o", window.jsHub);
      me.foundCodeEvent.fire(window.jsHub);
      // get previously fired events
      var missedEvents = jsHub.cachedEvents();
      for (var i = 0, l = missedEvents.length; i < l; i++) {
        me.newHubEvent.fire(missedEvents[i]);
      }
      // get configuration
      var config = jsHub.configure("inspector");
      
    } else {
      log("jsHubIsPresent: %o, jsHub: %o, me: %o", isPresent, window.jsHub, me);
      // jHub core lib is not present so change status
      // Note: actual CSS change made by cfg.status event handler
      me.cfg.resetProperty('status');
    }
    return isPresent;
  };
  
  // Private CustomEvent listeners, usage depends a bit on how subscribed:
  // 'this.subscribe' automatically receive 'type, args, me' parameters
  // 'object.on' receive only args parameters


  /**
  * "ieRepaint" event handler that uses a trick to force IE to repaint an element.
  * @method ieRepaint
  * @params {String} The id of the element to repaint
  * @private
  */
  function renderIeRepaint(type, args, me) {
    log("renderIeRepaint:  type: %o, args: %o, me: %o, this: %o, ua: %o", type, args, me, this, UA);
    // target IE versions less than 8
    if (YAHOO.env.ua.ie && YAHOO.env.ua.ie < 8 ){
      var element = args[0];
      log("IE repaint: force repaint of: %o", element);
      // This is a generally acceptable hack used elsewhere in the YUI library      
      Dom.setStyle(element, 'display', 'none');
      Dom.setStyle(element, 'display', 'block');
    };
  };

  /**
  * "foundCode" event handler that creates a SHA1 hash for a src JS file and checks it against a Configurator.
  * @method srcChecksum
  * @private
  */
  function srcChecksum(type, args, me) {
    log('TODO: srcChecksum - Check the jsHub core src SHA1, using metadata properties in the CONFIG and pass result in CustomEvent');
    log("srcChecksum:  type: %o, args: %o, me: %o, this: %o", type, args, me, this);
    
    /*
    * Example response from server URL http://gromit/configurator/tag_configurations/find_by_sha1/dd2635dce1602116cd281a4f8687f7ccd7508586.js :
    * {"warnings": {"tag_type": "debug"}, "errors": [], "info": {"url": "http://gromit/configurator/tag_configurations/12", "name": "Test r4948 - with Google capture plugin", "status": "up to date", "version": 1, "timestamp": "2009-06-29T13:07:48Z", "updated": "3 minutes", "site": ""}}
    */
    
    // TODO: actual logic
    var result = true;
    var status = false;
    // update UI status
    if(result){
      status = this.cfg.setProperty(DEFAULT_CONFIG.STATUS.key, "success");
    } else {
      status = this.cfg.setProperty(DEFAULT_CONFIG.STATUS.key, "warning");
    };
    log("srcChecksum: firing checksumCodeEvent: result: %o, status updated: %o", result, status);
    this.checksumCodeEvent.fire(result);
  };
  
  /**
  * "beforeRender" event handler that creates a context DIV element 
  * before rendering for context based CSS in YUI3.
  */
  function createCssContext(type, args, me) {
    var eContainerContext = Dom.get(Inspector.ID_CONTAINER);
    if (!eContainerContext) {
      // create the container div and add classes needed
      eContainerContext = new Element(document.createElement('div'));
      eContainerContext.set('id', Inspector.ID_CONTAINER);
      eContainerContext.addClass("yui-cssreset yui-cssfonts yui-cssgrids yui-cssbase jshub inspector yui-skin-sam position-br");
      eContainerContext.appendTo(document.body);
      log('Made Inspector CSS context');      
    }      
  };

  /** 
  * "beforeRender" event handler that creates the title for an Inspector in the header
  */  
  function templateTitle(type, args, me) {
    var oStrings = this.cfg.getProperty("strings")
    this.setHeader(format(TEMPLATES.PANEL_HEADER, oStrings['header_text']));
  }    
  /** 
  * "beforeRender" event handler that creates the version for an Inspector in the footer
  */ 
  function templateVersion(type, args, me) {
    var oStrings = this.cfg.getProperty("strings")
    this.setFooter(format(TEMPLATES.PANEL_FOOTER, oStrings['footer_text']));
  }
  
  /** 
  * "render" event handler that adds the in memory Module and AccordionView to the the body of the Inspector 
  */  
  function renderEventList (type, args, me) {
    log('Rendering: mEventlistModule: %o, event_list: %o into Inspector: %o', COMPONENTS.mEventlistModule, COMPONENTS.event_list, this);
    COMPONENTS.mEventlistModule.render(this.body);
    COMPONENTS.mEventlistModule.show();
    // add the Accordion DIV in the Module
    COMPONENTS.event_list.appendTo(Inspector.ID_ACCORDION);
  }
  
  /** 
  * "render" event handler that makes the Inspector Panel resizable 
  * ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
  */  
  function makeResizable(type, args, me) {
    // Check we havn't already added this
    if (COMPONENTS.resizer) {
      log('Inspector already resizable: %o', COMPONENTS.resizer);
      return false;
    }

    var oResizer = new Resize(this.id, {
      handles: ['br'],
      autoRatio: false,
      height: this.cfg.getProperty("height"),
      minWidth: 265,
      //minHeight: 290,
      status: false
    });

    // bind resize actions using 'on' to get data
    oResizer.on('resize', resizeInspectorBody, this, true);      
    oResizer.on('resize', resizeAccordionPanel, this, true);      
    oResizer.on('endResize', resizeInspectorBody, this, true);      

    // fix IE background color bug by hasLayout trick
    this.cfg.setProperty("height", '');
    log("IE fix: Forced repaint by setting height");

    // expose for later access, e.g. resizing
    COMPONENTS.resizer = oResizer;
    log('Made Inspector resizable: %o', COMPONENTS.resizer);
  };


  /** 
  * "resize" and "endResize" event handler that suppresses the Inspector resize via 'height' changes, and so
  * keeping automatic resizing of the body based on content height (CSS height = 'auto').
  * The visible size change is done by resizing the AccordionView Panels heights
  * NOTE: event 'args' and 'this' are different due to using 'on' vs. 'subscribe'
  */  
  function resizeInspectorBody(args) {
    // use set rather than queue for immediate re-paint
    this.cfg.setProperty("height", '');
    log('resizeInspectorBody args: %o, args.height: %o, this: %o, cfg.height: %o, Inspector.height: %o', args, args.height, this, this.cfg.getProperty("height"), this.element.offsetHeight);
  };

  /** 
  * "resize" event handler that makes the currently open Accordion panel grow to match the element 
  * that the resizer is bound to
  * NOTE: event 'args' and 'this' are different due to using 'on' vs. 'subscribe'
  */  
  function resizeAccordionPanel(args) { 
    // set a new height on the Accordion Panel Content
    // use CSS min-/max-height to enforce a max height
    // TODO: split height change by number of open Panels since AccordionView can be configured for this
    var aPanelContent = getActiveAccordionPanelContent();
    var ePanelContent = aPanelContent[0];
    var delta = args.height - this.element.offsetHeight;
    var existing_height = ePanelContent.offsetHeight;
    var new_height = existing_height + delta;
    ePanelContent.style.height = new_height + 'px';
    
    log('resizeAccordionPanel args: %o, args.height: %o, this: %o, panel: %o, panel.offsetHeight: %o, Inspector.height: %o', args, args.height, this, ePanelContent, ePanelContent.offsetHeight, this.element.offsetHeight);
  };
  
  /**
  * "state" config event handler to enable/disable resizing when the UI state changes
  */
  function toggleResizer(type, args, me){    
    // only do this if the Inspector has been rendered and the resizer attached.
    if (!COMPONENTS.resizer){
      log('toggleResizer: Inspector not rendered yet');
      return false;
    };
    log('toggleResizer: Inspector has been rendered');
    log('toggleResizer: type: %o, args: %o, me: %o, this: %o, resizer: %o', type, args, me, this, COMPONENTS.resizer)
    
    // Only state3 should be resizable
    if (args[0] !== 3) {
      COMPONENTS.resizer.lock();
    };
    if (args[0] === 3) {
      COMPONENTS.resizer.unlock();
    };
    log('toggleResizer: Locked or unlocked the resizer: %o', COMPONENTS.resizer);
  };
  
  /** 
  * "render" event handler that makes the Modules for content before the Event List
  * TODO: Container does not have a this.body.insertAt method which would make this easier
  */  
  function createDefaultContentModules1(type, args, me) {
    // get current strings for use
    var oStrings = this.cfg.getProperty("strings")
  
    // Small status text with background icon (state3)
    var mStatusModuleSmall = new Module("mStatusModuleSmall");
    // TODO: get message text based on STATUS
    mStatusModuleSmall.setBody(format(TEMPLATES.STATUS_MESSAGE, oStrings['success_message']));
    mStatusModuleSmall.render(this.body);
    // annotate div.yui-module
    Dom.addClass(mStatusModuleSmall.element, 'yui-g status small');
    // annotate div.bd
    Dom.addClass(mStatusModuleSmall.body, 'yui-u text');
    mStatusModuleSmall.show();
    COMPONENTS.mStatusModuleSmall = mStatusModuleSmall;
    log("Added Content: mStatusModuleSmall: %o", mStatusModuleSmall);

    // Large status text with background icon (state2)
    var mStatusModuleLarge = new Module("mStatusModuleLarge");
    // TODO: review HTML for 2 column setup
    mStatusModuleLarge.setBody(format(TEMPLATES.STATUS_PREFIX + TEMPLATES.STATUS_MESSAGE,  oStrings['success_message']));
    mStatusModuleLarge.render(this.body);
    Dom.addClass(mStatusModuleLarge.element, 'yui-g status large');
    Dom.addClass(mStatusModuleLarge.body, 'yui-u text');
    mStatusModuleLarge.show();
    COMPONENTS.mStatusModuleLarge = mStatusModuleLarge;
    log("Added Content: mStatusModuleLarge: %o", mStatusModuleLarge);

    /* TODO: use a DataSource to store the Events
    // Search section (state3)
    var mSearchModule = new Module("mSearchModule");      
    mSearchModule.setBody(TEMPLATES.SEARCH);
    mSearchModule.render(this.body);
    Dom.addClass(mSearchModule.element, 'search');
    Dom.addClass(mSearchModule.body, 'yui-gf');
    mSearchModule.show();
    COMPONENTS.mSearchModule = mSearchModule;
    log("Added Content: mSearchModule: %o", mSearchModule);
    */
  }; 

  /** 
  * "render" event handler that makes the Modules for content after the Event List
  * TODO: Container does not have a this.body.insertAt method which would make this easier
  */    
  function createDefaultContentModules2(type, args, me) {
    // get current strings for use
    var oStrings = this.cfg.getProperty("strings")

    // Large buttons (state2)
    var mButtonsModuleLarge = new Module("mButtonsModuleLarge");      
    mButtonsModuleLarge.setBody(TEMPLATES.LARGE_BUTTON);
    mButtonsModuleLarge.render(this.body);
    Dom.addClass(mButtonsModuleLarge.element, 'jshub-buttons large');
    mButtonsModuleLarge.show();
    Event.addListener(mButtonsModuleLarge.body, 'click', clickLargeButton, this, true);
    COMPONENTS.mButtonsModuleLarge = mButtonsModuleLarge;
    log("Added Content: mButtonsModuleLarge: %o", mButtonsModuleLarge);

    // Small buttons (state3)
    var mButtonsModuleSmall = new Module("mButtonsModuleSmall");      
    mButtonsModuleSmall.setBody(TEMPLATES.SMALL_BUTTON);
    mButtonsModuleSmall.render(this.body);
    Dom.addClass(mButtonsModuleSmall.element, 'jshub-buttons small');
    mButtonsModuleSmall.show();    
    Event.addListener(mButtonsModuleSmall.body, 'click', clickSmallButton, this, true);
    COMPONENTS.mButtonsModuleSmall = mButtonsModuleSmall;
    log("Added Content: mButtonsModuleSmall: %o", mButtonsModuleSmall);

    // Floating launcher (state1)
    var mLauncherModule = new Module("mLauncherModule");      
    mLauncherModule.setBody(TEMPLATES.LAUNCHER);
    mLauncherModule.render(this.body);
    mLauncherModule.show();
    Event.addListener(mLauncherModule.body, 'click', clickLauncher, this, true);
    
    COMPONENTS.mLauncherModule = mLauncherModule;
    log("Added Content: mLauncherModule: %o", mLauncherModule);
  };

  /**
  * "newHubEvent" event handler that processes the Hub Event and hands off for rendering.
  * @method receivedHubEvent
  * @private
  */
  function receivedHubEvent(type, args, me) {
    log("receivedHubEvent:  type: %o, args: %o, me: %o, this: %o", type, args, me, this);

    // get data from event args
    var oHubEvent = args[0], eventType = oHubEvent['type'];
    
    // panel name
    var sPanelType = EVENT_PANEL_MAPPINGS[eventType];
    
    // we got an unknown event.type
    if (!sPanelType) {
      log('receivedHubEvent: ignoring event: %o', oHubEvent);
      return false;
    }

    // TODO: determine panel index by CSS class not creation order
    var ePanelContent, aPanelContent = getAllAccordionPanelContent();
    if (sPanelType === "tagging-issues") {    
      ePanelContent = aPanelContent[-1]; // "tagging-issues" DISABLED
    };
    if (sPanelType === "inline-content-updates") {    
      ePanelContent = aPanelContent[-1]; // "inline-content-updates" DISABLED
    };
    if (sPanelType === "page") {    
      ePanelContent = aPanelContent[0]; // "page"
    };
    if (sPanelType === "user-interactions") {    
      ePanelContent = aPanelContent[1]; // "user-interactions"
    };
    
    // generate content from PANELS template strings
    var html = [];
    // create header
    html.push( format(PANELS[sPanelType].template_variable, 
               humanize(oHubEvent['type']) 
             ));
    // create body of name = value pairs, etc
    for (var key in oHubEvent['data']) {      
      var label = key;
      var value = oHubEvent['data'][label];
    
      // skip member functions, nested objects and empty elements
      if ( (typeof label !== 'string' && typeof label !== 'number') 
           || (/-source$/.test(label) || /-visibility$/.test(label)) ){
        log("Skipped label: %o, with value: %o, and typeof: %o in: %o", label, value, typeof value, oHubEvent['data']);
        continue;
      };
      if ( (value == "") 
           || (typeof value === 'object' && value.constructor !== Array) ){
        log("Skipped value: %o, with typeof: %o in: %o", value, typeof value, oHubEvent['data']);
        continue;
      };      
      
      // serialize value data if an Array, e.g. for categories
      if (value.constructor === Array){
        value = value.join(", ");
        log("Serialized label: %o, with value: %o, and typeof: %o in: %o", label, value, typeof value, oHubEvent['data']);
      };

      // create html string from data
      log("Found label: %o, with value: %o, and typeof: %o in: %o", label, value, typeof value, oHubEvent['data']);
      html.push( format(PANELS[sPanelType].template_value, 
                 humanize(label), 
                 value 
               ));
               
      // get the source as well, if available
      var source = oHubEvent['data'][label + "-source"];
      if (source) {
        log("Found source for: %o, with value: %o, and typeof: %o in: %o", label, source, typeof source, oHubEvent['data']);
        html.push( format(PANELS[sPanelType].template_value, 
                   "<em>from</em>", 
                   "<em>" + source + "</em>" 
                 ));
      }
    };
    html.push(TEMPLATES.HUB_EVENT_SEPARATOR);
    html = html.join("");

    
    // fire event with required data to action
    log("receivedHubEvent: firing renderHubEvent: %o html: %o", ePanelContent, html);
    this.renderHubEvent.fire(ePanelContent, html);
  };

  /**
  * "codeFound" event handler to get the Hub Plugins
  * @method getHubPluginInfo
  * @private
  */
  function getHubPluginInfo(type, args, me) {
    log('getHubPluginInfo: type: %o, args: %o, me: %o, this: %o', type, args, me, this)

    // Use API on detected lib passed in event.args rather Global reference
    var lib = args[0];
    var plugins = lib.getPluginInfo();
    log('getHubPluginInfo: plugins: %o', plugins);

    // TODO: determine panel index by CSS class not creation order
    var aPanelContent = getAllAccordionPanelContent();
    var ePanelContent = aPanelContent[2]; // 'data-sources'
    var sPanelType = "data-sources";

    // create an entry for each plugin
    for (var i = 0; i < plugins.length; i++) {
      plugin = plugins[i];
    
      // generate content from PANELS template strings
      var html = [];
      html.push( format(PANELS[sPanelType].template, 
                 plugin['name'],
                 humanize(plugin['type']),
                 plugin['vendor'], 
                 plugin['version']
               ));
      html.push(TEMPLATES.HUB_EVENT_SEPARATOR);
      html = html.join("");
 
     log("getHubPluginInfo: firing renderHubEvent: %o html: %o", ePanelContent, html);
     this.renderHubEvent.fire(ePanelContent, html);
    };
  };
  
  /**
  * "renderHubEvent" event handler that adds a Module to an Accordion Panel
  * @method templateEventToPanel
  * @private
  */
  function templateEventToPanel(type, args, me) {
    log("templateEventToPanel:  type: %o, args: %o, me: %o, this: %o", type, args, me, this);

    // get data from event args
    var ePanelContent = args[0];
    var html = args[1];
        
    // Module to render a Hub event
    var mHubEventModule = new Module(Dom.generateId());
    mHubEventModule.setBody(html);
    // TODO: logically the separator should be in the Module footer
    //mHubEventModule.setFooter(TEMPLATES.HUB_EVENT_SEPARATOR);    
    mHubEventModule.render(ePanelContent);
    Dom.addClass(mHubEventModule.element, 'event-item tag-status-item');
    mHubEventModule.show();
    COMPONENTS.mHubEventModule = mHubEventModule;
    
    // update count of child elements
    // Note: CSS selection seemed a bit overkill but this ties it to the HTML structure DIV>A>SPAN
    var eCount = ePanelContent.previousSibling.lastChild;
    // using parseInt we can wrap the number if desired, e.g. as (0) or [0]
    var iCount = parseInt(eCount.innerHTML, 10);
    iCount++;
    eCount.innerHTML = iCount ;
    // remove the 'empty' marker on the Panels Ancestor
    if (iCount > 0) {
      log('templateEventToPanel: panel: %o no longer empty', ePanelContent);
      var ePanel = Dom.getAncestorByClassName(ePanelContent, 'empty');
      Dom.replaceClass(ePanel, 'empty', 'full');
    }
    
    log('templateEventToPanel: new count: %o, for panel: %o', iCount, ePanelContent);
   
    log("templateEventToPanel: mHubEventModule: %o", mHubEventModule);
  };
  
  /**
  * "state" config change handler
  * TODO: useful to have a previousState property for transistions
  * @method setUIState
  * @private
  */
  function setUIState(type, args, me) {
    log('setUIState: type: %o, args: %o, me: %o, this: %o', type, args, me, this)

    var state = args[0] || this.cfg.getProperty(DEFAULT_CONFIG.STATE.key);
    // TODO: iterate over a CONFIG list of CSS classes
    Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 1);      
    Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 2);      
    Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 3);      
    Dom.addClass(this.innerElement, Inspector.CSS_STATE_PREFIX + state);
    
    // Positoning behaviour
    // Positions the Panel parent element and resets top and left to 0 to get original 
    // position relative to container after drag/resize
    // TODO: handle IE6 and other browsers that don't support position:fixed in CSS
    if (state === 1){
      log("Position: bottom right fixed? scroll: %o, viewport: %o, x: %o, y: %o", [Dom.getDocumentScrollLeft(), Dom.getDocumentScrollTop()], [Dom.getViewportWidth(), Dom.getViewportHeight()], this.body.offsetWidth, this.body.offsetHeight);
      Dom.removeClass(Inspector.ID_CONTAINER, 'position-tr');
      Dom.addClass(Inspector.ID_CONTAINER, 'position-br');
      Dom.setStyle(this.element, 'top', '0');
      Dom.setStyle(this.element, 'left', '0');
      this.cfg.setProperty('constraintoviewport', true);
    };
    if (state === 2){
      log("Position: top right fixed? scroll: %o, viewport: %o, x: %o, y: %o", [Dom.getDocumentScrollLeft(), Dom.getDocumentScrollTop()], [Dom.getViewportWidth(), Dom.getViewportHeight()], this.body.offsetWidth, this.body.offsetHeight);      
      // Position the main containing element ad reset top and left to 0 to get original position relative to container
      Dom.removeClass(Inspector.ID_CONTAINER, 'position-br');
      Dom.addClass(Inspector.ID_CONTAINER, 'position-tr');
      Dom.setStyle(this.element, 'top', '0');
      Dom.setStyle(this.element, 'left', '0');
      this.cfg.setProperty('constraintoviewport', true);
    };
    if (state === 3){
      log("Position: clear fixed? scroll: %o, viewport: %o, x: %o, y: %o", [Dom.getDocumentScrollLeft(), Dom.getDocumentScrollTop()], [Dom.getViewportWidth(), Dom.getViewportHeight()], this.body.offsetWidth, this.body.offsetHeight);
      this.cfg.setProperty('constraintoviewport', false);
    };
  };

  /**
  * "status" config change handler
  * TODO: useful to have a previousStatus property for transistions
  * @method setUIStatus
  * @private
  */  
  function setUIStatus(type, args, me) {
    log('setUIStatus: type: %o, args: %o, me: %o, this: %o', type, args, me, this)
    
    var status = args[0] || this.cfg.getProperty(DEFAULT_CONFIG.STATUS.key);
    // TODO: iterate over a CONFIG list of CSS classes
    Dom.removeClass(this.body, "info");      
    Dom.removeClass(this.body, "success");      
    Dom.removeClass(this.body, "warning");      
    Dom.removeClass(this.body, "error");      
    Dom.addClass(this.body, status);
    
    // Change UI strings
    var message
    var oStrings = this.cfg.getProperty("strings")
    switch (status) {
      case 'success':
        message = oStrings['success_message'];
        break;
      case 'info':
        message = oStrings['info_message'];
        break;
      case 'warning':
        message = oStrings['warning_message'];
        break;
      case 'error':
        message = oStrings['error_message'];
        break;
    }
    COMPONENTS.mStatusModuleSmall.setBody(format(TEMPLATES.STATUS_MESSAGE, message));
    COMPONENTS.mStatusModuleLarge.setBody(format(TEMPLATES.STATUS_PREFIX + TEMPLATES.STATUS_MESSAGE, message));
    log('setUIStatus: status: %o, message: %o', status, message)    
    
  };

  /**
  * "click" event handler for Large Button Module in state3 that changes UI state
  * @method clickLargeButton
  * @private
  */  
  function clickLargeButton (e) {
    log('clickLargeButton: e: %o, this: %o', e, this)

    // No state3 for 'info' status - button is a link to jsHub.org website
    if (this.cfg.getProperty(DEFAULT_CONFIG.STATUS.key) !== 'info'){    
      Event.preventDefault(e);
      var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, 3);
    }
    
    log('jsHub.org Inspector Large Button clicked: %o', state);
    return state;
  };
    
  /**
  * "click" event handler for Small Button Module in state2 that changes UI state
  * @method clickSmallButton
  * @private
  */  
  function clickSmallButton (e) {
    log('clickSmallButton: e: %o, this: %o', e, this)

    Event.preventDefault(e);
    var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, 2);

    log('jsHub.org Inspector Small Button clicked: %o', state);
    return state;
  };
  
  /**
  * "click" event handler for Launcher Module that changes UI state
  * @method clickLauncher
  * @private
  */  
  function clickLauncher (e) {
    log('clickLauncher: e: %o, this: %o', e, this)
    Event.preventDefault(e);
    var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, 2);
    log('jsHub.org Inspector Launcher clicked: %o', state);
    return state;
  };
  
  
  // End Private methods for Event handlers
  
  // We declare the Inspector constructor to inherit from Panel and override existing or add additional methods
  YAHOO.lang.extend(Inspector, Panel, {
  
    /**
    * The Inspector initialization method is automatically called by the 
    * constructor, and  sets up all custom events and event handlers.
    * @method init
    * @param {String} el The element ID representing the Inspector <em>OR</em>
    * @param {HTMLElement} el The element representing the Inspector
    * @param {Object} userConfig The configuration object literal 
    * containing the configuration that should be set for this Inspector. 
    * See configuration documentation for more details.
    */  
    init : function(el, userConfig) {
      log("jsHub.org Inspector init start");

      // Check dependencies
      // TODO: this could probably be better to stop any execution
      if(!(YAHOO && Module && Panel && Event && CustomEvent && Element && Resize && AccordionView)){
        log('The jsHub Inspector is missing some required libraries.');
        return false;
      }

      // First calls the superclass Panel init so our Panel has its predefined configuration attributes
      // Note that we don't pass the user config in here yet because we only want it executed once
      Inspector.superclass.init.call(this, el/*, userConfig*/);

      log("init: firing beforeInitEvent");
      this.beforeInitEvent.fire(Inspector);

      // subscribe to monitor Inspector config changes
      this.cfg.subscribe('configChanged', function(type, args, me){log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.cfg.subscribe('autoFillHeight', function(type, args, me){log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.cfg.subscribeToConfigEvent('height', function(type, args, me){log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)}, this, this);
      this.cfg.subscribeToConfigEvent('state', setUIState);
      this.cfg.subscribeToConfigEvent('state', toggleResizer);
      this.cfg.subscribeToConfigEvent('status', setUIStatus);

      // now apply the users config - which will also cause subscribed config events to fire (set above)
      if (userConfig) {
        this.cfg.applyConfig(userConfig, true);
      } 
       
      // Subscribe to Inspector UI life-cycle events
      this.subscribe('beforeRender', createCssContext);
      this.subscribe('beforeRender', templateTitle);
      this.subscribe('beforeRender', templateVersion);

      this.subscribe('render', makeResizable);
      // create all visible content - hidden by CSS depending on states
      this.subscribe('render', createDefaultContentModules1);
      this.subscribe('render', renderEventList);
      this.subscribe('render', createDefaultContentModules2);
      
      this.subscribe('changeContent', function(type, args, me){log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('beforeShow', function(type, args, me){log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('show', function(type, args, me){log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('hide', function(type, args, me){log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});

      // custom functionality events
      this.subscribe('ieRepaint', renderIeRepaint);
      this.subscribe('foundCode', getHubPluginInfo);
      this.subscribe('foundCode', srcChecksum);
      this.subscribe('checksumCode', function(type, args, me){log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('newHubEvent', receivedHubEvent);
      this.subscribe('renderHubEvent', templateEventToPanel);

      // Setup UI
      // Useful references to generated HTMLElements
      // jshub_inspector_c = this.element
      // jshub_inspector = this.innerElement
      // jshub_inspector_h = this.header
      
      // add CSS to target browser/platform specific problems
      Dom.addClass(this.element, this.browser +" "+ this.platform)
      // make sure we have a Body as early as possible to add things to
      this.setBody('<!-- Create a body element in Init to add Modules to -->');
      
      // Do init functionality
      createEventList(this);
      jsHubIsPresent(this);
      
      // Last
      log("jsHub.org Inspector init complete");
      this.initEvent.fire(Inspector);
    },
    
    /**
    * Initializes the custom events for the Inspector which are fired 
    * automatically at appropriate times.
    */
    initEvents: function () {
      log("jsHub.org Inspector initEvents start");

      // First calls the superclass Panel initEvents so our Panel has its predefined custom events
      Inspector.superclass.initEvents.call(this);
      
      var SIGNATURE = CustomEvent.LIST;
      
      /**
      * CustomEvent fired when a repaint of an Element in IE is needed
      * @event ieRepaint
      */
      this.ieRepaintEvent = this.createEvent(EVENT_TYPES.IE_REPAINT);
      this.ieRepaintEvent.signature = SIGNATURE;


      /**
      * CustomEvent fired after detecting the jsHub core lib
      * @event foundCodeEvent
      */
      this.foundCodeEvent = this.createEvent(EVENT_TYPES.FOUND_CODE);
      this.foundCodeEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after SHA1 checksumming a src JS file
      * @event checksumCodeEvent
      */
      this.checksumCodeEvent = this.createEvent(EVENT_TYPES.CHECKSUM_CODE);
      this.checksumCodeEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after changing the state of the UI
      * @event changeStatusEvent
      */
      this.changeStateEvent = this.createEvent(EVENT_TYPES.CHANGE_STATE);
      this.changeStateEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after changing the status of the UI
      * @event changeStatusEvent
      */
      this.changeStatusEvent = this.createEvent(EVENT_TYPES.CHANGE_STATUS);
      this.changeStatusEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after receiving a Hub Event via a jsHub.bind callback
      * @event newHubEvent
      */
      this.newHubEvent = this.createEvent(EVENT_TYPES.NEW_HUB_EVENT);
      this.newHubEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after processing a Hub Event via a jsHub.bind callback
      * @event renderHubEvent
      */
      this.renderHubEvent = this.createEvent(EVENT_TYPES.RENDER_HUB_EVENT);
      this.renderHubEvent.signature = SIGNATURE;


      log("jsHub.org Inspector initEvents complete");
    },
    
    /**
    * Initializes the class's configurable properties which can be changed 
    * using the Inspector's Config object (cfg).
    * @method initDefaultConfig
    */
    initDefaultConfig : function() {
      log("jsHub.org Inspector initDefaultConfig start");

      // First calls the superclass Panel initDefaultConfig so our Panel has its predefined configuration attributes
      Inspector.superclass.initDefaultConfig.call(this);
      
      // then we start adding our own
      
			/** 
			* Sets the intial state of the Inspector.
      *
      * @config STATE
			* @type Number
			* @default 1
      *     <dl>
      *         <dt>1</dt><dd><em>Integer</em> : Floating.</dd>
      *         <dt>2</dt><dd><em>Integer</em> : Minimised.</dd>
      *         <dt>3</dt><dd><em>Integer</em> : Maximised with event viewer.</dd>
      *     </dl>
			*/
			this.cfg.addProperty(DEFAULT_CONFIG.STATE.key, {
				value: DEFAULT_CONFIG.STATE.value,
				validator: DEFAULT_CONFIG.STATE.validator
			});

			/** 
			* Sets the intial status of the Inspector.
      *
			* @config STATUS
			* @type string
			* @default info
      *     <dl>
      *         <dt>info</dt><dd><em>String</em> : No jsHub core lib on page or other problem.</dd>
      *         <dt>warning</dt><dd><em>String</em> : Either the checksum of the jsHub core lib failed or there are duplicate metadata entries on the page.</dd>
      *         <dt>error</dt><dd><em>String</em> : Something went wrong with the Inspector.</dd>
      *         <dt>success</dt><dd><em>String</em> : Everything is working fine.</dd>
      *     </dl>
			*/
			this.cfg.addProperty(DEFAULT_CONFIG.STATUS.key, {
				value: DEFAULT_CONFIG.STATUS.value,
				validator: DEFAULT_CONFIG.STATUS.validator
			});
			
      /**
      * UI Strings used by the Panel
      * 
      * @config STRINGS
      * @type Object
      * @default An object literal with the properties shown below:
      *     <dl>
      *         <dt>close</dt><dd><em>String</em> : The string to use for the close icon. Defaults to "Close".</dd>
      *         <dt>header_text</dt><dd><em>String</em> : The string to use for the header text.</dd>
      *         <dt>footer_text</dt><dd><em>String</em> : The string to use for the footer text.</dd>
      *         <dt>success_message</dt><dd><em>String</em> : The string to use for the success message.</dd>
      *         <dt>warning_message</dt><dd><em>String</em> : The string to use for the warning message.</dd>
      *         <dt>info_message</dt><dd><em>String</em> : The string to use for the info message.</dd>
      *         <dt>error_message</dt><dd><em>String</em> : The string to use for the error message.</dd>
      *     </dl>
      */      
      this.cfg.addProperty(DEFAULT_CONFIG.STRINGS.key, { 
        value:DEFAULT_CONFIG.STRINGS.value,
        handler:this.configStrings,
        validator:DEFAULT_CONFIG.STRINGS.validator
      });			

      log("jsHub.org Inspector initDefaultConfig complete");
    },
  
    /**
    * The Inspector can only be rendered inside its correct CSS context which is created on beforeRenderEvent.
    * @method render
    * @return {boolean} Success or failure of the render
    */  
    render : function() {  
      log('jsHub.org Inspector render start');
      return Inspector.superclass.render.call(this, Inspector.ID_CONTAINER);
    },

    // Custom public methods

    /**
    * Gets the Inspectors current state.
    * @method getCurrentState
    * @return {Integer} 
    */  
    getCurrentState : function() {
      var state = this.cfg.getProperty(DEFAULT_CONFIG.STATE.key);
      log('jsHub.org Inspector state: %o', state);
      return state;
    },

    /**
    * Gets the Inspectors current status.
    * @method getCurrentStatus
    * @return {String} the string identifier (used for CSS classes, etc)
    */  
    getCurrentStatus : function() {
      var status = this.cfg.getProperty(DEFAULT_CONFIG.STATUS.key);
      log('jsHub.org Inspector status: %o', status);
      return status;
    },

    /**
    * Sets the Inspectors current state (for UI dev only).
    * @method _setCurrentState
    * @private
    * @return {Boolean}
    */  
    _setCurrentState : function(state) {
      var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, state);
      log('jsHub.org Inspector state changed: %o', state);
      return state;
    },

    /**
    * Gets the Inspectors current status (for UI dev only).
    * @method _setCurrentStatus
    * @private    
    * @return {Boolean}
    */  
    _setCurrentStatus : function(status) {
      var status = this.cfg.setProperty(DEFAULT_CONFIG.STATUS.key, status);
      log('jsHub.org Inspector status changed: %o', status);
      return status;
    },

    /**
    * Event handler overrides the default close method, instead switching to state1
    * @method _doClose
    * @private
    * @param {DOMEvent} e
    * @return {Boolean}
    */  
    _doClose : function (e) {
      Event.preventDefault(e);
      var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, 1);
      log('jsHub.org Inspector close clicked: %o', state);
      return state;
    },
    
    /**
    * Adds an event to a Panel (for UI dev only).
    * @method _addHubEvent
    * @private    
    * @return {Boolean}
    */  
    _addHubEvent : function(event) {
      log('jsHub.org Inspector new event: %o', event);
      // fire CustomEvent with Hub event payload
      var result = this.newHubEvent.fire(event);
      return result;      
    },    
    
    /**
    * Provides a readable name for the Inspector instance.
    * @method toString
    * @return {String} String representation of the object 
    */  
    toString : function() {
        return META.NAME +" v"+ META.VERSION +" r"+ META.BUILD; 
    }
    
  });
  
  // Namespace our widget and expose it for use
  YAHOO.namespace('JSHUB_ORG');
  YAHOO.JSHUB_ORG.Inspector = Inspector;  
  // Last: Register the module with YAHOO for use with the YUILoader
  YAHOO.register('JSHUB_ORG.Inspector', YAHOO.JSHUB_ORG.Inspector, {version: META.VERSION, build: META.BUILD});

})();