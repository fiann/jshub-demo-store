/* 
jsHub open source tagging
Copyright (c) 2009 jsHub.org
Released under the BSD license, see http://github.com/jshub/jshub-core/raw/master/LICENSE.txt 

This file also contains code supplied by and Copyright (c) 2009, Yahoo! Inc. under the BSD License: http://developer.yahoo.net/yui/license.txt
This file also contains code supplied by and Copyright (c) 2009 John Resig under the MIT License http://docs.jquery.com/License 
*/
"use strict";

/*!
 * JavaScript Debug - v0.3 - 6/8/2009
 * http://benalman.com/projects/javascript-debug-console-log/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 * 
 * With lots of help from Paul Irish!
 * http://paulirish.com/
 */

// Script: JavaScript Debug: A simple wrapper for console.log
//
// *Version: 0.3, Last Updated: 6/8/2009*
// 
// Tested with Internet Explorer 6-8, Firefox 3, Safari 3-4, Chrome, Opera 9.
// 
// Home       - http://benalman.com/projects/javascript-debug-console-log/
// GitHub     - http://github.com/cowboy/javascript-debug/
// Source     - http://github.com/cowboy/javascript-debug/raw/master/ba-debug.js
// (Minified) - http://github.com/cowboy/javascript-debug/raw/master/ba-debug.min.js (1.1kb)
// 
// About: License
// 
// Copyright (c) 2009 "Cowboy" Ben Alman,
// Licensed under the MIT license.
// http://benalman.com/about/license/
// 
// About: Support and Testing
// 
// Information about what browsers this code has been tested in.
// 
// Browsers Tested - Internet Explorer 6-8, Firefox 3-3.5, Safari 3-4, Chrome, Opera 9.
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Examples - http://benalman.com/code/projects/javascript-debug/examples/debug/
// 
// About: Revision History
// 
// 0.3 - (6/8/2009) Initial release
// 
// Topic: Pass-through console methods
// 
// assert, clear, count, dir, dirxml, group, groupEnd, profile, profileEnd,
// time, timeEnd, trace
// 
// These console methods are passed through (but only if both the console and
// the method exists), so use them without fear of reprisal. Note that these
// methods will not be passed through if the logging level is set to 0 via
// <debug.setLevel>.

window.debug = (function(){
  var window = this,
    
    // Some convenient shortcuts.
    aps = Array.prototype.slice,
    con = window.console,
    
    // Public object to be returned.
    that = {},
    
    callback_func,
    callback_force,
    
    // Default logging level, show everything.
    log_level = 9,
    
    // Logging methods, in "priority order". Not all console implementations
    // will utilize these, but they will be used in the callback passed to
    // setCallback.
    log_methods = [ 'error', 'warn', 'info', 'debug', 'log' ],
    
    // Pass these methods through to the console if they exist, otherwise just
    // fail gracefully. These methods are provided for convenience.
    pass_methods = 'assert clear count dir dirxml group groupEnd profile profileEnd time timeEnd trace'.split(' '),
    idx = pass_methods.length,
    
    // Logs are stored here so that they can be recalled as necessary.
    logs = [];
  
  while ( --idx >= 0 ) {
    (function( method ){
      
      // Generate pass-through methods. These methods will be called, if they
      // exist, as long as the logging level is non-zero.
      that[ method ] = function() {
        log_level !== 0 && con && con[ method ]
          && con[ method ].apply( con, arguments );
      }
      
    })( pass_methods[idx] );
  }
  
  idx = log_methods.length;
  while ( --idx >= 0 ) {
    (function( idx, level ){
      
      // Method: debug.log
      // 
      // Call the console.log method if available. Adds an entry into the logs
      // array for a callback specified via <debug.setCallback>.
      // 
      // Usage:
      // 
      //  debug.log( object [, object, ...] );                               - -
      // 
      // Arguments:
      // 
      //  object - (Object) Any valid JavaScript object.
      
      // Method: debug.debug
      // 
      // Call the console.debug method if available, otherwise call console.log.
      // Adds an entry into the logs array for a callback specified via
      // <debug.setCallback>.
      // 
      // Usage:
      // 
      //  debug.debug( object [, object, ...] );                             - -
      // 
      // Arguments:
      // 
      //  object - (Object) Any valid JavaScript object.
      
      // Method: debug.info
      // 
      // Call the console.info method if available, otherwise call console.log.
      // Adds an entry into the logs array for a callback specified via
      // <debug.setCallback>.
      // 
      // Usage:
      // 
      //  debug.info( object [, object, ...] );                              - -
      // 
      // Arguments:
      // 
      //  object - (Object) Any valid JavaScript object.
      
      // Method: debug.warn
      // 
      // Call the console.warn method if available, otherwise call console.log.
      // Adds an entry into the logs array for a callback specified via
      // <debug.setCallback>.
      // 
      // Usage:
      // 
      //  debug.warn( object [, object, ...] );                              - -
      // 
      // Arguments:
      // 
      //  object - (Object) Any valid JavaScript object.
      
      // Method: debug.error
      // 
      // Call the console.error method if available, otherwise call console.log.
      // Adds an entry into the logs array for a callback specified via
      // <debug.setCallback>.
      // 
      // Usage:
      // 
      //  debug.error( object [, object, ...] );                             - -
      // 
      // Arguments:
      // 
      //  object - (Object) Any valid JavaScript object.
      
      that[ level ] = function() {
        var args = aps.call( arguments ),
          log_arr = [ level ].concat( args );
        
        logs.push( log_arr );
        exec_callback( log_arr );
        
        if ( !con || !is_level( idx ) ) { return; }
        
        con.firebug ? con[ level ].apply( window, args )
          : con[ level ] ? con[ level ]( args )
          : con.log( args );
      };
      
    })( idx, log_methods[idx] );
  }
  
  // Execute the callback function if set.
  function exec_callback( args ) {
    if ( callback_func && (callback_force || !con || !con.log) ) {
      callback_func.apply( window, args );
    }
  };
  
  // Method: debug.setLevel
  // 
  // Set a minimum or maximum logging level for the console. Doesn't affect
  // the <debug.setCallback> callback function, but if set to 0 to disable
  // logging, <Pass-through console methods> will be disabled as well.
  // 
  // Usage:
  // 
  //  debug.setLevel( [ level ] )                                            - -
  // 
  // Arguments:
  // 
  //  level - (Number) If 0, disables logging. If negative, shows N lowest
  //    priority levels of log messages. If positive, shows N highest priority
  //    levels of log messages.
  //
  // Priority levels:
  // 
  //   log (1) < debug (2) < info (3) < warn (4) < error (5)
  
  that.setLevel = function( level ) {
    log_level = typeof level === 'number' ? level : 9;
  };
  
  // Determine if the level is visible given the current log_level.
  function is_level( level ) {
    return log_level > 0
      ? log_level > level
      : log_methods.length + log_level <= level;
  };
  
  // Method: debug.setCallback
  // 
  // Set a callback to be used if logging isn't possible due to console.log
  // not existing. If unlogged logs exist when callback is set, they will all
  // be logged immediately unless a limit is specified.
  // 
  // Usage:
  // 
  //  debug.setCallback( callback [, force ] [, limit ] )
  // 
  // Arguments:
  // 
  //  callback - (Function) The aforementioned callback function. The first
  //    argument is the logging level, and all subsequent arguments are those
  //    passed to the initial debug logging method.
  //  force - (Boolean) If false, log to console.log if available, otherwise
  //    callback. If true, log to both console.log and callback.
  //  limit - (Number) If specified, number of lines to limit initial scrollback
  //    to.
  
  that.setCallback = function() {
    var args = aps.call( arguments ),
      max = logs.length,
      i = max;
    
    callback_func = args.shift() || null;
    callback_force = typeof args[0] === 'boolean' ? args.shift() : false;
    
    i -= typeof args[0] === 'number' ? args.shift() : max;
    
    while ( i < max ) {
      exec_callback( logs[i++] );
    }
  };
  
  return that;
})();

/**
 * Core hub functionality for jsHub tag
 * @module hub
 * @class jsHub
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery */
"use strict";

(function () {

  // global namespace
  var global = window, 
  
  // instance of jsHub object
  jsHub,
  
  /**
   * Core event dispatcher functionality of the hub
   * @class Hub
   * @property listeners
   */
  Hub = function () {

    /** Plugins that have registered with the hub. */
    var plugins = [],
    
    /** Events which have already occurred. */
    eventCache = [],

    /** Configuration values cache */
    config = {},

    /**
     * a listener has an authentication token and a callback
     * @class Listener
     * @for Hub
     * @param token {string}
     * @param callback {function}
     */
    Listener = function (token, callback) {
      this.token = token;
      this.callback = callback;
    },

    /**
     * A simple event object
     * @class Event
     * @for Hub
     * @param name {string}
     * @param data {object}
     * @param timestamp {number} an optional timestamp value. 
     */
    Event = function (name, data, timestamp) {
      this.type = name;
      this.timestamp = timestamp || jsHub.safe.getTimestamp();
      this.data = data;
    },
    
    /**
     * A store for the listeners registered to each event
     */
    EventListenerCache = function () {
      /** The underlying cache store */
      var cache = {},
      
      /** The listeners registered for the event name */
      cached = function (eventName) {
        return cache[eventName] || {
          "data-capture": [],
          "data-transport": []
        };
      };
      
      this.bind = function (eventName, token, phase, callback) {
        jsHub.logger.debug("EventListenerCache: registering " + token + " to event " + eventName + " in phase " + phase);
        var registered = cached(eventName);
        // Use only one of the valid phase names
        if (! registered[phase]) {
          jsHub.logger.info("EventListenerCache: invalid phase name " + phase + ", using data-capture");
          phase = "data-capture";
        }
        // if already present, then replace the callback function
        for (var found = false, i = 0; i < registered[phase].length; i++) {
          if (registered[phase][i].token === token) {
            registered[phase][i].callback = callback;
            found = true;
            break;
          }
        }
        // otherwise add it
        if (!found) {
          registered[phase].push(new Listener(token, callback));
        }
        cache[eventName] = registered;
      };
      
      this.listenersFor = function (eventName) {
        // find all registered listeners for the specific event, and for "*"
        var registered = cached(eventName), registeredStar = cached('*');
        var deduped = [], all = [].concat(registered['data-capture'])
        	.concat(registeredStar['data-capture'])
        	.concat(registered['data-transport'])
        	.concat(registeredStar['data-transport']);
        o:
        for (var i = 0, n1 = all.length; i < n1; i++) {
          for (var j = 0, n2 = deduped.length; j < n2; j++) {
            if (deduped[j].token === all[i].token) {
              continue o;
            }
          }
          deduped.push(all[i]);
        }
        return deduped;
      };
    },

    /** An instance of the event listener cache */
    listeners = new EventListenerCache(),

    /**
     * The event dispatcher filters event data before passing to listeners
     * @class EventDispatcher
     * @for Hub
     */
    EventDispatcher = function () {
  
      /**
       * Locate a token within a comma separate string.
       * @method containsToken
       * @param string {string}
       * @param token {string}
       */
      var containsToken = function (string, token) {
        string = string.split(",");
        for (var i = 0; i < string.length; i++) {
          if (token === jsHub.util.trim(string[i])) {
            return true;
          }
        }
        return false;
      },
  
      /**
       * TODO: Description
       * @method validate
       * @param token {string}
       * @param payload {object}
       */
      validate = function (token, payload) {
        var who = jsHub.util.trim(payload.event_visibility);
        if (who === undefined || who === "" || who === "*") {
          return true;
        }
        return containsToken(who, token);
      },
  
      /**
       * TODO: Description
       * @method filter
       * @param token {string}
       * @param data {object}
       */
      filter = function (token, data) {
        // TODO remove fields from data that do not validate
        var filtered = {};
        jsHub.util.each(data, function (value, key) {
          if (/_visibility$/.test(key) === false) {
            var fieldVisibility = data[key + "_visibility"];
            if (typeof fieldVisibility !== 'string'
                || fieldVisibility === "" 
                || fieldVisibility === "*"
                || containsToken(fieldVisibility, token)) {
              filtered[key] = value;
            }
          }
        });
        return filtered;
      };

      /**
       * TODO: Description
       * @method dispatch
       * @param name {string} the name of the event
       * @param listener {Listener} the listener object to call back to
       * @param data {object}
       */        
      this.dispatch = function (name, listener, data, timestamp) {
        var evt, filteredData, extraData;
        
        if (validate(listener.token, data)) {
          // remove private fields from the data for each listener
          filteredData = filter(listener.token, data);
          // send to the listener
          jsHub.logger.debug("Sending event %s to listener %s with data", name, listener.token, filteredData);
          evt = new Event(name, filteredData, timestamp);
          extraData = listener.callback(evt);
          // merge any additional data found by the listener into the data
          if (extraData) {
            jsHub.util.merge(data, extraData);
            jsHub.logger.debug("Listener %s added data, event is now ", listener.token, data);
          }
        }
      };
    },
  
    /** An instance of the event dispatcher */
    firewall = new EventDispatcher();

    /**
     * Bind a listener to a named event.
     * @method bind
     * @for jsHub
     * @param eventName {string} the name of the event to bind.
     * Note that "*" is a special event name, which is taken to mean that 
     * the listener wants to be informed of every event that occurs 
     * (provided it has visibility of that event).
     * @param listener {object} an metadata object describing the listener, which will
     * contain at least these fields: <code>id</code> the identifier for the plugin, which
     * may be matched against the value of the <code>data-visibility</code>
     * attribute of the DOM node containing the event, and <code>callback</code> a function
     * to be called when the event is fired.
     */
    this.bind = function (eventName, listener) {
      if (typeof eventName !== "string" || eventName === "") {
        jsHub.logger.warn("jsHub.bind(): Invalid event name " + eventName);
        return;
      }
      if (typeof listener !== "object") {
        jsHub.logger.warn("jsHub.bind(): Missing listener object " + listener);
        return;
      }
      if (! listener.id || ! listener.eventHandler) {
        jsHub.logger.warn("jsHub.bind(): Listener object missing required field id or eventHandler");
        return;
      }
      listeners.bind(eventName, listener.id, listener.type, listener.eventHandler);
    };

    /**
     * Fire a named event, and inform all listeners
     * @method trigger
     * @for jsHub
     * @param eventName {string}
     * @param data {object} a data object containing name=value fields for the event data
     * @param timestamp {number} a timestamp, which can be used to associate this event
     * with other events created due to the same user action in the browser. Optional, will
     * be created automatically if not supplied.
     */
    this.trigger = function (eventName, data, timestamp) {
      jsHub.logger.group("Event %s triggered with data", eventName, (data || "'none'"));
      // empty object if not defined
      data = data || {};
      // keep the event in the local cache
      var evt = new Event(eventName, data, timestamp);
      eventCache.push(evt);
      // find all registered listeners for the specific event, and for "*"
      var registered = listeners.listenersFor(eventName);
      for (var k = 0; k < registered.length; k++) {
        firewall.dispatch(eventName, registered[k], data, timestamp);
      }
      jsHub.logger.groupEnd();

      // additional special behavior for particular event types
      if (eventName === "plugin-initialization-start") {
        plugins.push(data);
        if (config[data.id]) {
          this.configure(data.id, config[data.id]);
        }
      }
    };
    
    /**
     * Retrieve an array of the events which have already been fired.
     * Primarily used by the Activity Inspector, so that it can be injected after the
     * page has loaded and still retrieve the events that have already occurred.
     */
    this.cachedEvents = function () {
      // take a deep copy to prevent the data being tampered with 
      var clone = [], i;
      for (i = 0; i < eventCache.length; i++) {
        var evt = eventCache[i], evt_clone = {};
        evt_clone.type = evt.type;
        evt_clone.timestamp = evt.timestamp;
        evt_clone.data = {};
        for (var field in evt.data) {
          if (typeof evt.data[field] === 'string' || typeof evt.data[field] === 'number') {
            evt_clone.data[field] = evt.data[field];
          }
        }
        clone.push(evt_clone);
      }
      return clone;
    };
  
    /**
     * Get information about plugins that have registered with
     * the hub using trigger("plugin-initialization-start").
     */
    this.getPluginInfo = function () {
      // take a deep copy to prevent the data being tampered with 
      var clone = [], i;
      for (i = 0; i < plugins.length; i++) {
        var plugin = plugins[i], plugin_clone = {};
        for (var field in plugin) {
          if (typeof plugin[field] === 'string' || typeof plugin[field] === 'number') {
            plugin_clone[field] = plugin[field];
          }
        }
        clone.push(plugin_clone);
      }
      return clone;
    };
	
  	/**
  	 * Configure a value for the hub or a plugin.
  	 * @param {String} key the name of the plugin. The first component is the name of the plugin
  	 *        which the configuration is intended for, such as "logger". The key may also contain 
  	 *        a dotted path to a specific configuration property, such as "logger.level".
  	 */
    this.configure = function (key, conf) {
      if (typeof key !== 'string') {
        throw new Error('Invalid configuration key');
      }
      
      var plugin, notify, field, keys = key.split('.'), confType = typeof conf;
      
      notify = function () {
        var i, field = keys.slice(1, keys.length).join('.');
        for (i = 0; i < plugins.length; i++) {
          if (plugin === plugins[i].id && typeof plugins[i].configure === 'function') {
            plugins[i].configure(field, conf);
            return;
          }
        }
      };
      
      // the first component of the key is the plugin name
      plugin = keys[0];

      // the part after the final dot is the object key
      field = keys[keys.length - 1];

      // the part up to the final dot is the namespace to cache the configuration value
      for (var cacheNode = config, i = 0; i < keys.length - 1; i++) {
        cacheNode[keys[i]] = cacheNode[keys[i]] || {};
        cacheNode = cacheNode[keys[i]]; 
      }
      
      if (confType === 'string' || confType === 'number' || confType === 'boolean') {
        cacheNode[field] = conf;
        notify();
      } else if (conf === null) {
  	  	delete cacheNode[field];
        notify();
      } else if (confType === 'object') {
        for (var name in conf) {
          // we don't want inherited values
          if (conf.hasOwnProperty(name)) {
            this.configure(key + "." + name, conf[name]);
          }
        }
      } else {
        return cacheNode[field];
      }
    };
  };

  // jsHub object in global namespace
  jsHub = global.jsHub = new Hub();

  // Create an object to return safe instances of important variables
  jsHub.safe = function (obj) {
    var safeObject;
    if ('document' === obj) {
      safeObject = {
        // no document DOM properties are available
        location: {
          hash : document.location.hash,
          // includes the port if present, e.g. localhost:8080
          host : document.location.host,
          // only the domain name, e.g. localhost
          hostname : document.location.hostname,
          href: document.location.href,
          pathname : document.location.pathname,
          port : document.location.port,
          protocol: document.location.protocol,
          // includes the query string if present, e.g. ?foo=bar
          search : document.location.search
        },
        title: document.title,
        referrer: (document.referrer === null) ? "" : document.referrer,
        cookies: document.cookies,
        domain: 'Unsafe property'
      };
    } else {
      // empty object that can be enhanced
      safeObject = {};
    }
    return safeObject;
  };
  
  /**
   * Get a timestamp for an event.
   * TODO add sequence / random component
   */
  jsHub.safe.getTimestamp = function () {
    return new Date().getTime();
  };
  
  /**
   * Utility functions
   */
  var Utils = function () {
    
    var utils = this;
  
    /**
     * Trim whitespace at beginning and end of value and
     * remove multiple spaces
     */
    utils.trim = function (value) {
      if (typeof value === 'string') {
        value = value.replace(/(&nbsp;|\s)+/g, ' ').replace(/(^\s+)|(\s+$)/g, '');
      }
      return value;
    };
    
    /**
     * Check that an object is an array. 
     */
    utils.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
    
    /**
     * Iterate over an array or object, applying the function to each item 
     * in the array.
     * @param the source object
     * @param fn the function which will be applied
     * @return the source object
     */
    utils.each = function (object, fn) {
      if (utils.isArray(object)) {
        for (var i = 0, limit = object.length; i < limit; i++) {
          fn.call(jsHub, object[i], i);
        }
      } else if (typeof object === 'object') {
        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            fn.call(jsHub, object[key], key);
          }
        }
      }
      return object;
    };
    
    /**
     * Augment an object with additional properties, overwriting existing properties
     * on the object with new properties.
     */
    utils.merge = function (object, additions) {
      object = object || {};
      additions = additions || {};
      for (var key in additions) {
        if (additions.hasOwnProperty(key)) {
          object[key] = additions[key];
        }
      }
      return object;
    };
  };
  
  jsHub.util = new Utils();

})();

/**
 * Data transport via Form submission to an iFrame 
 * Creates an HTML form in the DOM and encodes the data into the POST body for sending to a server.
 * The form is submitted to a named iframe for asynchronous cross domain delivery.
 * used in plugins
 * @module form-transport
 * @class FormTransport
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub, ActiveXObject */
"use strict";

(function () {

  var FormTransport = function () {

    /**
     * Send a request to the server as a POST or GET method form request. 
     * <p>The data is sent via a hidden iframe which is dynamically created in the page, so that the
     * form submission does not interfere with the history and behaviour of the back button in 
     * the browser.
     * <p>This function does not perform any serialization. It is the responsibility of the data
     * output plugins to prepare the data in the format required by their server.
     * @method dispatch
     * @for FormTransport
     * @param method {string} one of "GET" or "POST", not case sensitive. If the method is not
     * supplied or does not match on of these values, then the submission will be rejected and
     * the function will return without taking any action.
     * @param url {string} a URL for the endpoint to send the data to. The URL is processed by
     * the browser, and so it may be fully qualified or relative to the page, as per a normal 
     * link. If the url is not specified the method will return without taking any action.
     * @param data {object} an object containing name=value pairs that will be sent as form data.
     * The name of each field in the object will be used as the form field name. The value must
     * be either a string, a number, or an array of strings / numbers, in which case multiple
     * form fields with the same name will be created. Any parameters which do not match this
     * expected format will be ignored.
     * @return Object with references to the document, form and iframe that has been created
     */
    this.dispatch = function (method, url, data) {
      var timestamp = + new Date(), 
        doc = document, 
        msie = (/MSIE/).test(navigator.userAgent),
        form, 
        formID = "jshub-form-" + timestamp, 
        iframe, 
        iframeID = "jshub-iframe-" + timestamp, 
        htmlelements;
      
      /*
       * This data transport only supports POST or GET
       */
      if (!(/^POST|GET$/i.test(method)) || !url || (/^javascript:|file:/i.test(url))) {
        return false;
      }
      data = data || {}; // NOTE - why would we send an empty request? For cookies/referer info?
    
      // Create the form
      form = doc.createElement("form");
      form.id = formID;
      // FIXME form.method doesn't seem to work in our Envjs - need to update to 1.1?
      form.method = method;
      form.action = url;
      form.style.visibility = "hidden";
      form.style.position = "absolute";
      form.style.top = 0;
      form.style.cssClass = "jshub-form";

      // remove any existing fields
      while (form.hasChildNodes()) {
        form.removeChild(form.lastChild);
      }

      /**
       * Recurse over the data and add a hidden field to the form based on the values supplied
       * Arrays result in multiple inputs with the same name
       * @param {Object} value
       * @param {Object} prop
       */
      jsHub.util.each(data, function appendField(value, prop) {
        var i, input;
        if (typeof value === 'string' || typeof value === 'number') {
          //In a ActiveXObject('htmlfile') IE won't let you assign a name using the DOM in an object, must do it the hacky way
          if (msie) {
            input = doc.createElement('<input name="' + prop + '" />');
          } else {          
            input = doc.createElement("input");
            input.name = prop;
          }
          input.type = "hidden";
          input.value = value;
          form.appendChild(input);
        } else if (jsHub.util.isArray(value)) {
          // TODO improve array test for security: http://blog.360.yahoo.com/blog-TBPekxc1dLNy5DOloPfzVvFIVOWMB0li?p=916
          for (i = 0; i < value.length; i++) {
            if (typeof value[i] === 'string' || typeof value[i] === 'number') {
              appendField(value[i], prop);
            }
          }
        } else {
          jsHub.logger.error("This value cannot be converted for transport");
        }        
      });

      // Create the iframe
      //IE won't let you assign a name using the DOM, must do it the hacky way
      if (msie) {
        iframe = doc.createElement('<iframe name="' + iframeID + '" />');
      } else {
        iframe = doc.createElement("iframe");
        iframe.name = iframeID;
      }

      iframe.id = iframeID;
      // TODO - work out which src is better for history handling
      iframe.src = "#";
      //iframe.src = "javascript:false";
      iframe.style.visibility = "hidden";
      iframe.style.position = "absolute";
      iframe.style.top = 0;
      iframe.style.cssClass = "jshub-iframe";
 
      /*
        add the generated elements to the document, or htmlfile object for IE to stop navigation clicks    
        NOTE: htmlfile wont work in IE Server 2003 see slides  http://www.slideshare.net/joewalker/comet-making-the-web-a-2way-medium
        ref: http://www.julienlecomte.net/blog/2007/11/30/
        ref: http://cometdaily.com/2007/11/18/ie-activexhtmlfile-transport-part-ii/      
        ref: http://grack.com/blog/2009/07/28/a-quieter-window-name-transport-for-ie/
        TODO: may need CollectGarbage(); see thread http://groups.google.com/group/orbited-users/browse_thread/thread/e337ac03d0c9f13f
      */
      if (msie) {
        jsHub.logger.log('IE specific branch to avoid navigational clicks');
        try {
          if ("ActiveXObject" in window) {
            doc = new ActiveXObject("htmlfile");
            doc.open();
            doc.write('<html><head><\/head><body><\/body><\/html>');
            doc.body.innerHTML = form.outerHTML + iframe.outerHTML;
            doc.close();
            // get new references to the elements for binding events too, etc
            form = doc.getElementById(form.id);
            iframe = doc.getElementById(iframe.id);

            jsHub.logger.log('IE ActiveXObject("htmlfile") created: %o', doc);
          }
        } catch (e) {
          jsHub.logger.error('IE ActiveXObject("htmlfile") error: %o', e.message);
        }
        
      } else {
        doc.body.appendChild(form);
        doc.body.appendChild(iframe);
      }
      
      // check elements created sucessfully
      if (!form) {
        jsHub.logger.error('Form Transport form creation error');
      }
      // some older browsers do not return null for a failed iframe creation so check the nodeType
      if (!iframe || typeof (iframe.nodeType) === 'undefined') {
        jsHub.logger.error('Form Transport iframe creation error');
      }

      // store references
      htmlelements = {"doc": doc, "form": form, "url" : form.action, "iframe": iframe};

      // NOTE - for future use give us an opportunity to know when the transport is complete 
      iframe.transportState = 0;
      
      // In IE iframe.onload does not necessarily mean the iframe page itself has loaded? But it seems to work
      // ref: http://support.microsoft.com/kb/239638
      // see comments: http://msdn.microsoft.com/en-us/library/ms535258(VS.85).aspx
      iframe.onload = function () {
        jsHub.trigger("form-transport-complete", htmlelements);
        
        // remove form and iframe to clean DOM and prevent "resubmit the form" dialogs
        form.parentNode.removeChild(form);
        iframe.parentNode.removeChild(iframe);
      };
      // TODO clear iframe cache etc
      iframe.onunload = function () {};
  
      // Set the iframe as the submission target of the form, tied together by the timestamp
      form.target = iframe.id;
      // Submit the form, sent via the iframe
      form.submit();            
      jsHub.trigger("form-transport-sent", htmlelements);
            
      return htmlelements;
    };
  };
  
  jsHub.dispatchViaForm = (new FormTransport()).dispatch;

})();
    
/*
    http://www.JSON.org/json2.js
    2009-09-29
    (with minor modifications for jshub.org)

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

/* ******************************
 * Not used by jsHub

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}
 */

(function () {
  
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the jsHub object does not yet have a toJSON method, give it one.

    jsHub.json = jsHub.json || {};
    if (typeof jsHub.json.stringify !== 'function') {
        jsHub.json.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


/* *******************************************
 *  Not used by jsHub
 * ******************************************* 

// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }  */
}());
/**
 * Alias console wrapper for logging.
 * @module hub
 * @for jsHub
 *//*--------------------------------------------------------------------------*/
// TODO: Enable sending of logging data to remote servers

// JSLint options
/*global jsHub */
"use strict";

(function () {

  jsHub.logger = (function () {
    var level = 9; // jsHub.configure('logger.level');
    if (level && level >= 1) {
      return window.debug;
    } else {
      var i, nullLogger = {}, doNothing = function () {},
        names = ["log", "debug", "info", "warn", "error", "assert", "dir", 
		  "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", 
		  "profile", "profileEnd"];
      for (i = 0; i < names.length; ++i) {
        nullLogger[names[i]] = function () {
          // logger just swallows output
          // we don't really need this closure but jslint insists on it
          return doNothing;
        }(i);
      }
  	  return nullLogger;
    }
  })();

})();

/**
 * Enhancements to jQuery for common functions
 * used in microformat plugins
 * @module microformats
 * @class MicroformatAPI
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub, jQuery */
"use strict";


(function ($) {

  var MicroformatAPI = {
    
    /**
     * Implements value excepting rules for working out the value of a property
     * @method getMicroformatPropertyValue
     * @parmeter last {boolean} optional flag to return only the last source ordered value rather than concatenate multiple values
     * @parameter separator {string} optional sepeartor to use to concatenate multiple values
     * default separator is ', ' if not specified
     * @return The value of the property or null
     */
    getMicroformatPropertyValue: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = null, sources;
    
      /*
       * <abbr> design pattern (contriversial)
       * ref: http://microformats.org/wiki/abbr-design-pattern
       */
      if ($(this).find('abbr').length === 1) {
        value = $(this).find('abbr').attr('title');
      }
    
      /*
       * get value from explicit 'value' declarations
       */
      else {
        sources = $(this).find('.value');
        sources = sources.not(sources.find('.value'));
        if (sources.length === 1) {
          value = sources.html();
        }

        /*
         * get value from multiple value elements, e.g. categories or nested formats
         * these are concatenated according to whitespace rules
         */
        else if (sources.length > 1) {
          value = '';
          $.each(sources, function (idx, elm) {
            separator = separator || ' ';
            value += $(elm).text();
            // if this is the last value we don't want an extra separator
            if (idx !== sources.length - 1) {
              value += separator;
            }
          });
        }

        /*
         * get last value from multiple value elements, e.g. categories or nested formats
         * these are overriden according to source order rules
         */
        else if ($(this).text() !== '' && this.length > 1 && last === true) {
          $.each(this, function (idx, elm) {
            value = $(elm).text();
          });
        }
        
        /*
         * finally use the contained text as the value (removes HTML tags)
         */
        else if ($(this).html() !== '') {
          value = $(this).html();
        }
      }
      
      /*
       * trim whitespace at beginning and end of value
       * jsHub.util.trim normalizes &nbsp; entities to spaces
       */
      value = jsHub.util.trim(value);
      
      return value;
    },
    
    /**
     * Implements value excepting rules for working out the value of a property
     * @method excerptMultipleValues
     * @return An array containing all values found for the property or null
     */
    excerptMultipleValues: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = [], node = $(this), sources;
    
      /*
       * get value from explicit 'value' declarations
       */
      sources = node.find('.value');
      sources = sources.not(sources.find('.value'));
      if (sources.length >= 1) {
        $.each(sources, function (idx, elm) {
          var nodeValue = sources.text().split(/\s+/);
          $.each(nodeValue, function (entry) {
            value.push(entry);
          });
        });
      }

      /*
       * or use the contained text as the value (removes HTML tags).
       * $(node).text() concatenates multiple node text without any separator, so we have
       * to split each value, not the whole string.
       */
      else if (node.text() !== '') {
        node.each(function () {
          $.each($(this).text().split(/\s+/), function (idx, word) {
            value.push(word);
          });
        });
      }
      
      return (value.length > 0) ? value : null;
    },
    
    /**
     * Implements value class pattern excepting rules for working out the value of a property
     * @method excerptValueClassData
     * @return a JSON object containing the fields <code>type</code> and <code>value</code> if
     * present, or null if no data is found. The <code>value</code> field will be a string if
     * there is a single value, or an array of strings if there are multiple values found.
     */
    excerptValueClassData: function () {
    
      /*
       * Default value if not specified is 'true'
       */
      var type, value, defaultValue = 'true', typeNodes = $(this).find('.type'), valueNodes;
    
    
      /*
       * If the type is not specified, then the whole content of the attribute node is the
       * type, and the default value is implied. If the whole content is empty, the attribute 
       * invalid.
       */
      if (typeNodes.length === 0) {
        type = $(this).html();
        if (type === "") {
          return null;
        }

        /*
         * trim whitespace at beginning and end of the type
         */
        type = jsHub.util.trim(type);

        return {
          type: type,
          value: defaultValue
        };
      }
    
    /*
     * If a single .type node is found, then concatenate .value nodes, or use the default
     * value if no .value nodes are found.
     */
    else if (typeNodes.length === 1) {
        type = typeNodes.html();
        valueNodes = $(this).find('.value');
        valueNodes = valueNodes.not(valueNodes.find('.value'));
        if (valueNodes.length === 0) {
          value = defaultValue;
        } else if (valueNodes.length === 1) {
          value = $(valueNodes[0]).html();
        } else {
          value = [];
          valueNodes.each(function () {
            value.push($(this).html());
          });
        }

        return {
          type: type,
          value: value
        };
      }

      /*
       * If there is more than one .type node, the context is not valid
       */
      return null;
    }
    
  };
  
  /*
   * Add the API as object methods on the any jQuery object
   */
  $.extend($.fn, MicroformatAPI);
    
})(jQuery);
/** 
 * A plugin to create an analytics object from technographic data 
 *
 * @module data-capture
 * @class technographics
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
/*jslint strict: true */
"use strict";
 
 
(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Technographics Plugin',
    id: 'technographic',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Capture technographic data, when triggered by the 'page-view' event
   * @method capture
   * @param event {Object} Config object for the plugin, containing data found by other plugins, and
   * the context (DOM node) to start parsing from.
   * @property metadata
   * @event technographic.StartParsing
   * @event hub.technographicEvent
   * @event technographic.CompleteParsing
   */
  metadata.eventHandler = function capture(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("technographic-parse-start", event);

    // extract hPage from html dom
    var document = window.document, data = event.data, found = {};
    
    /*
     * collect technographic environment data, e.g. screen size, browser plugins, 
     * js version etc
     */ 
    
    // Page URL is the default for hPage.url
    // Force a cast to string as document.location.href is not a string when
    // returned by env.js / rhino
    found.url = document.location.href;
    if (!data.url) {
      data.url = found.url;
      data['url-source'] = "window.location";
    }
    
    // Page title is the default for hPage.title
    found.title = document.title;
    if (!data.title) {
      data.title = found.title;
      data['title-source'] = "document.title";
    }
    
    // Document referrer is the default for hPage.referrer
    found.referrer = document.referrer;
    if (!data.referrer) {
      data.referrer = found.referrer;
      data['referrer-source'] = "document.referrer";
    }
    
    // and send to output plugins
    jsHub.trigger("technographic-parse-complete", data);

    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata);

  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();
/** 
 * A plugin to parse the hAuthentication syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hAuthentication-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jQuery, jsHub */
/*jslint strict: true */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hAuthentication Microformat Parser Plugin',
    id: 'hAuthentication-plugin',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hauthentication-parse-start
   * @event  hauthentication-data-found
   * @event  hauthentication-parse-complete
   */
  metadata.eventHandler = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hauthentication-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var console, context, sources, data;
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hAuthentication from HTML DOM (not source code), excluding nested hAuthentications
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hauthentication' css class on the body element
     */
    sources = $('.hauthentication', context);
    sources = sources.not(sources.find('.hauthentication'));
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      authentication: []
    };
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["user-id", "auth-method"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hAuthentication
       */
      var hauthentication = {};
      var root = $(elm);
      
      /*
       * get the property data using class names
       */
      $.each(properties, function (count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
        node = node.not(node.find('.hauthentication'));
        value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hauthentication[name] = value;
        }
      });
            
      jsHub.trigger("hauthentication-data-found", {
        count: idx + 1,
        element: elm,
        data: hauthentication
      });

      // issue an authentication event to be logged
      jsHub.trigger("authentication", hauthentication);
      
      // append this event to the summary
      data.authentication.push(hauthentication);
    });
    
    jsHub.trigger("hauthentication-parse-complete", data);
    
    // don't merge into source event, authentication data is not part of the
    // page view event, just triggered by it
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata);
  jsHub.bind("content-updated", metadata);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})(jQuery);
/** 
 * A plugin to parse the hPage syntax microformat and pass it to the
 * jsHub event hub for delivery.
 * 
 * The input data format is defined by http://jshub.org/hPage microformat
 * The output is a data object containing the fields listed in the event object
 * schema.
 * 
 * The field name mapping is:
 * <pre>
 *   "name" : "page-name"
 *   "title" : "page-title"
 *   "referrer" : "page-referrer"
 *   "type" : "page-type"
 *   "category" : "page-category"
 *   "attribute" : attributes object
 * </pre>
 *
 * @module data-capture
 * @class hPage-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery, jsHub */
/*jslint strict: true */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPage Microformat Parser Plugin',
    id: 'hPage-plugin',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hpage-parse-start
   * @event  hpage-data-found
   * @event  hpage-parse-complete
   */
  metadata.eventHandler = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpage-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var console, context, sources, hPage, properties;
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for microformat data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hPage from HTML DOM (not source code), excluding nested hPages
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hpage' css class on the body element
     */
    sources = $('.hpage', context);
    sources = sources.not(sources.find('.hpage'));
    
    /*
     * The parser will populate an object to represent all the hPage data found in 
     * the context, according to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    hPage = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    properties = {
      ".name": "page-name",
      ".title": "page-title",
      ".referrer": "page-referrer",
      ".type": "page-type",
      ".fragment": "page-fragment"
    };
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hpage
       */
      var nodeData = {};
      
      // TODO resolve includes first
      
      // jQuery gives an empty string if the element / attribute is not present so cascade through values
      // to defaults
      var root = $(elm);
      
      /*
       * get the property data with failover to inherited or technographic data supplied by another plugin
       */
      // use the array of class names
      // TODO this can be refactored to the API
      $.each(properties, function (classname, fieldname) {
        var node, value;
        // exclude properties in nested hPages
        node = root.find(classname);
        node = node.not(node.find('.hpage'));
        value = node.getMicroformatPropertyValue(true);
        if (value !== null) {
          nodeData[fieldname] = value;
          nodeData[fieldname + "-source"] = metadata.id;
        }
      });

      /*
       * Merge the data for the singular fields from this hPage node, into the hPage for 
       * the whole context
       */
      // TODO: use data-indexes to override source order 
      $.extend(true, hPage, nodeData);
      
      // custom string handling for some properties, e.g. multi value properties
      var categories = [], categoryNodes = $('.category', elm);
      categoryNodes = categoryNodes.not(categoryNodes.find('.hpage .category'));
      categories = categoryNodes.excerptMultipleValues();
      if (categories !== null) {
        nodeData["page-category"] = categories;
        nodeData["page-category-source"] = metadata.id;
        // the categories for the overall hPage are the union of what was found previously
        // and in this node. NB $.unique uses identity not value so it doesn't strip duplicate strings
        hPage["page-category"] = (hPage["page-category"] || []);
        $.each(categories, function (idx, entry) {
          if ($(hPage["page-category"]).index(entry) === -1) {
            hPage["page-category"].push(entry);
          }
        });
      }
    
      // attributes use value class pattern http://microformats.org/wiki/value-class-pattern
      // we can have multiple attributes, each one has a type and a value
      // output in the data is an array: {name:[value, value], name:value}
      var attributes = $('.attribute', elm);
      attributes.each(function () {
        var attribute = $(this).excerptValueClassData(), type, value, allValues;
        if (attribute !== null) {
          type = attribute.type;
          value = attribute.value;
          hPage.attributes = (hPage.attributes || {});
          allValues = $.makeArray(hPage.attributes[type]); 
          $.merge(allValues, $.makeArray(value));
          var unique = []; 
          for (var i = 0; i < allValues.length; i++) {
            if ($.inArray(allValues[i], unique) === -1) {
              unique.push(allValues[i]);
            }
          }
          if (unique.length === 1) {
            unique = allValues[0];
          }
          hPage.attributes[type] = unique;
        }
      });
      
      jsHub.trigger("hpage-node-found", {
        count: idx + 1,
        element: elm,
        data: nodeData
      });
      
    });
    
    /*
     * The hPage for the context is only valid if the required fields are all present.
     * If not, don't put any of the data into the page view event.
     */
    if (hPage["page-name"]) {
      jsHub.trigger("hpage-found", {
        context: context,
        hpage: hPage
      });
    } else {
      hPage = null;
    }
  
    // Fire a debug event
    jsHub.trigger("hpage-parse-complete");
    return hPage;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata);
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add data to
   * page view events when AJAX loads a new partial page view
   */
  jsHub.bind("content-updated", metadata);
  
  /*
   * Last trigger an event to show that the plugin has been registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})(jQuery);
/** 
 * A plugin to parse the hProduct syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hProduct-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jQuery, jsHub */
/*jslint strict: true */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hProduct Microformat Parser Plugin',
    id: 'hProduct-plugin',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hproduct-parse-start
   * @event  hproduct-data-found
   * @event  hproduct-parse-complete
   */
  metadata.eventHandler = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hproduct-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var console, context, sources, data, timestamp;
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for microformat data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
  /*
   * The event timestamp for this object should match the event that generated it, because
   * it is not tied to its own specific user action.
   */
    if (event.timestamp) {
      timestamp = event.timestamp;
    }
  
    /*
     * Extract the hProduct nodes from HTML DOM (not source code), excluding nested hProducts
     * If there is no '.hproduct' node in the page, then no product view event will be 
     * generated.
     */
    sources = $('.hproduct', context);
    sources = sources.not(sources.find('.hproduct'));
    //console.debug("Found %s .hproduct islands in context %s", sources.length, context);
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      products : []
    };
  
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     * This is the mapping of microformat class names to event object field names
     */
    // TODO support currency design pattern
    var properties = {
      ".brand" : "product-brand",
      ".category" : "product-category", 
      ".description" : "product-description", 
      ".fn" : "product-name",
      ".product-id" : "product-id", 
      ".price" : "product-price"
    };
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hProduct
       */
      var hproduct = {};
      var root = $(elm);
      
      /*
       * get the property data from class names
       */
      $.each(properties, function (classname, fieldname) {
        var node, value;
        // exclude properties in nested hPages
        node = root.find(classname);
        node = node.not(node.find('.hproduct'));
        value = node.getMicroformatPropertyValue(true);
        if (value !== null) {
          hproduct[fieldname] = value;
        }
      });	  
    
      // attributes use value class pattern http://microformats.org/wiki/value-class-pattern
      // we can have multiple attributes, each one has a type and a value
      // output in the data is an array: {name:[value, value], name:value}
      var attributes = $('.attribute', elm);
      attributes.each(function () {
        var attribute = $(this).excerptValueClassData(), type, value, allValues;
        if (attribute !== null) {
          type = attribute.type;
          value = attribute.value;
          hproduct.attributes = (hproduct.attributes || {});
          allValues = $.makeArray(hproduct.attributes[type]); 
          $.merge(allValues, $.makeArray(value));
          var unique = []; 
          for (var i = 0; i < allValues.length; i++) {
            if ($.inArray(allValues[i], unique) === -1) {
              unique.push(allValues[i]);
            }
          }
          if (unique.length === 1) {
            unique = allValues[0];
          }
          hproduct.attributes[type] = unique;
        }
      });
    
      /*
       * Special processing for fields that don't take the value from the text node
       * of the microformat.
       */
      var photos = $('img.photo', elm);
      photos.each(function () {
        var url = $(this).attr('src');
        if (url !== null) {
          hproduct['product-photo'] = $.makeArray(hproduct['product-photo']);
          hproduct['product-photo'].push(url);
          if (hproduct['product-photo'].length === 1) {
            hproduct['product-photo'] = hproduct['product-photo'][0];
          }
        }
      });
    
      var urls = $('a.url', elm);
      urls.each(function () {
        var url = $(this).attr('href');
        if (url !== null) {
          hproduct['product-url'] = $.makeArray(hproduct['product-url']);
          hproduct['product-url'].push(url);
          if (hproduct['product-url'].length === 1) {
            hproduct['product-url'] = hproduct['product-url'][0];
          }
        }
      });
      
      jsHub.trigger("hproduct-data-found", {
        count: idx + 1,
        element: elm,
        data: hproduct
      });
      
      // issue an product view event to be logged
      jsHub.trigger("product-view", hproduct, timestamp);
      
      /*
       * Append this hProduct object into the data to return
       */
      data.products.push(hproduct);
    });
    
    jsHub.trigger("hproduct-parse-complete", data);
    
  // don't return data as the product view is not part of the page view event that triggered
  // the parsing
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for .hproduct microformats and generate
   * product view events
   */
  jsHub.bind("page-view", metadata);
    
  /*
   * Bind the plugin to the Hub to look for .hproduct microformats and generate
   * product view events
   */
  jsHub.bind("content-updated", metadata);
    
  /*
   * Last trigger an event to show that the plugin has been registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})(jQuery);
/** 
 * A plugin to parse the hPurchase syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hPurchase-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery, jsHub */
/*jslint strict: true */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPurchase Microformat Parser Plugin',
    id: 'hPurchase-plugin',
    version: 0.1,
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hpurchase-parse-start
   * @event  hpurchase-data-found
   * @event  hpurchase-parse-complete
   */
  metadata.eventHandler = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpurchase-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var console, context, sources, data;    
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hAuthentication from HTML DOM (not source code), excluding nested hAuthentications
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hauthentication' css class on the body element
     */
    sources = $('.hpurchase', context);
    sources = sources.not(sources.find('.hpurchase'));
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["product-id", "cart-id", "cart-price", "discount", "shipping-price", "taxes", "net-price", "payment-method", "status"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hPurchase
       */
      var hpurchase = {};
      var root = $(elm);
      
      /*
       * get the property data and its visibility
       */
      // use the array of class names 
      // TODO this can be refactored to the API
      $.each(properties, function (count, name) {
        var value, visibility, classname = '.' + name;
        // exclude properties in nested microformats
        var node = root.find(classname);
        node = node.not(node.find('.hpurchase'));
        value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hpurchase[name] = value;
        }
      });
      
      jsHub.trigger("hpurchase-data-found", {
        count: idx + 1,
        element: elm,
        hpurchase: hpurchase
      });
      
      // issue an checkout event to be logged  
      jsHub.trigger("checkout", hpurchase);
      
    });
    
    jsHub.trigger("hpurchase-parse-complete", data);
    
    /*
     * Don't merge the data, the purchase is a separate event from the page view
     * the triggered the parsing.
     */
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata);
  
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})(jQuery);
/** 
 * A plugin to capture markup data from Google Analytics markup on the page.
 *
 * @module data-capture
 * @class google-analytics-markup-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub, jQuery */
/*jslint nomen: false */
"use strict";

(function ($) {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Google Analytics Markup Plugin',
    id: 'google-analytics-markup',
    version: '0.1 experimental',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view' event
   * @method capture
   * @param event {Object}    Event object with current data for the page view.
   * @property metadata
   * @event google-analytics-parse-start
   * @event google-analytics-parse-complete
   */
  var capture = function (event) {
  
    // All local vars set here so nothing is accidentally made global.
    var context, pagenames, data, previous;
    
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    // initially empty
    pagenames = [];
    
    // data we find here goes back into the event.data field
    data = event.data || {};
    
    // we need to know if there is already a value defined
    previous = {
      "value": data['page-name'],
      "source": data['page-name-source']
    };
    
    // extract GA <script> block from html dom
    jsHub.trigger("google-analytics-parse-start");
  
    // if there is a GA script node, then look for the page name being sent from it
    $('script', context).each(function () {
      var source = this.innerHTML, matches, pagename;
      if (typeof source === 'string') {
        matches = source.match(/pageTracker\._trackPageview\((.*)\);/);
        if (matches) {
          if (matches[1].match(/^\s*$/)) {
            // _trackPageview() without args records the page url
            pagename = jsHub.safe('document').location.pathname;
            data['page-name-source'] = 'location.pathname';
          } else {
            // otherwise it has been explicitly specified
            pagename = matches[1].replace(/^\s+/, '').replace(/\s+$/, '');
            pagename = pagename.match(/^(['"]|&quot;?)(.+)(\1)$/)[2];
            data['page-name-source'] = metadata.id;
          }
          pagenames.push(pagename);
          // last value specified wins as the output
          data['page-name'] = pagename;
        }
      }
    });

    // we want to raise a warning if we have found more than page name
    // it is also a warning if the field has been previously set to a different value
    // by another parsing plugin
    if ((pagenames.length > 1) || (pagenames.length > 0 && previous.value)) {
      jsHub.trigger("duplicate-value-warning", {
        "source": metadata.name,
        "fields": {
          "name": {
            "previous": previous,
            "found": pagenames.join(", ")
          }
        }
      });
      data.warnings = data.warnings || {};
      data.warnings[metadata.id] = pagenames.join(", ");
      if (previous.source) {
        data.warnings[previous.source] = data.warnings[previous.value];
      }
    }
    
    jsHub.trigger("google-analytics-parse-complete", pagenames);
    
    return data;
  };
  
  ////////// Inline events //////////////
  
  /**
   * Create a proxy that intercepts calls to the pageTracker._trackPageview() function.
   * The proxy creates a jsHub event, and then passes on the message to the underlying
   * GA tracker.
   * Bound to the data-capture-start event.
   * @method initializeInlineTracking
   * @event google-analytics-initialize-tracking
   */
  var initializeInlineTracking = function initializeInlineTracking() {
    jsHub.trigger("google-analytics-initialize-tracking", {
      _gat: window._gat
    });
    if (window._gat) {
      var createProxyTracker = function (realPageTracker) {
        var field, proxy = {};
        for (field in realPageTracker) {
          if (field) { // we really do want everything, but jslint enforces this 
            proxy[field] = realPageTracker[field];
          }
        }
        
        // Intercept the call to the GA tag, record it, then pass it on
        proxy._trackPageview = function (pagename) {
          var data = {
            "context": "#do-not-drill-down-on-this-event",
            "page-name": pagename
          };
          jsHub.trigger("page-view", data);
          realPageTracker._trackPageview(pagename);
        };
        
        return proxy;
      };
      
      // make sure the proxy tracker is in the page
      if (window.pageTracker) {
        window.pageTracker = createProxyTracker(window.pageTracker);
      }
      
      var field, realGAT = window._gat, proxyGAT = {};
      for (field in realGAT) {
        if (field) { // we really do want everything, but jslint enforces this 
          proxyGAT[field] = realGAT[field];
        }
      }
      proxyGAT._getTracker = function (acct) {
        var realTracker = realGAT._getTracker(acct);
        return createProxyTracker(realTracker);
      };
    }
  };
  
  /**
   * Route the event to the correct handler
   */
  metadata.eventHandler = function (event) {
    if (event.type === "page-view") {
      return capture(event);
    } else if (event.type === "data-capture-start") {
      initializeInlineTracking();
    }
  };
  
  // Register the code to run when a page-view event is fired
  jsHub.bind("page-view", metadata);
  jsHub.bind("data-capture-start", metadata);
})(jQuery);
/**
 * A plugin to send output to the Causata system, using the POST transport and
 * in JSON format expected by Causata.
 *
 * @module data-transport
 * @class causata-post-plugin
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global YUI, jsHub */
"use strict";

(function () {

    /**
     * Metadata about this plug-in for use by UI tools and the Hub
     */
    var metadata = {
      id: 'causata-transport',
      name: 'Causata Transport Plugin',
      version: 0.1,
      vendor: 'Causata Inc', 
      type: 'data-transport'
    },

    /**
     * The events that will be captured and sent to the Causata servers
     */
    boundEvents = ['page-view', 'product-view', 'authentication', 'checkout'],

    /**
     * The config object for this plugin
     */
    config = {
      server : null,
      account : null
    };

    // First trigger an event to show that the plugin is being registered
    jsHub.trigger("plugin-initialization-start", metadata);

    /**
     * Event driven anonymous function bound to 'page-view'
     * @method transport
     * @param event {Object} the event to serialize and send to the server
     * @property metadata
     */
    metadata.eventHandler = function transport(event) {

      jsHub.logger.group("Causata output: sending '%s' event", event.type);

      // cannot send message if server is not configured
      if (typeof config.server !== 'string') {
        jsHub.trigger('plugin-error', {
          message : "Server hostname not specified",
          source : metadata.id
        });
        jsHub.logger.groupEnd();
        return;
      }

      /*
       * Serialize data as expected format, see
       * https://intra.causata.com/code/causata/wiki/JavascriptTag/WireFormat
       */
      var outputEvent = {
        timestamp: event.timestamp,
        eventType: event.type,
        attributes: []
      };

      for (var field in event.data) {
        if ("string" === typeof event.data[field] || "number" === typeof event.data[field]) {
          outputEvent.attributes.push({
            name: field,
            value: event.data[field]
          });
        }
      }

      var outputData = {
        sender: metadata.name + " v" + metadata.version,
        event: jsHub.json.stringify(outputEvent)
      };

      var protocol = (("https:" === jsHub.safe('document').location.protocol) ? "https://" : "http://");

      // dispatch via API function
      jsHub.dispatchViaForm("POST", protocol + config.server, outputData);
      jsHub.logger.groupEnd();
    };

    /**
     * Receive a configuration update
     */
    metadata.configure = function (key, value) {
      config[key] = value;
    };

    /*
     * Bind the plugin to the Hub so as to run when events we are interested in occur
     */
    for (var i = 0; i < boundEvents.length; i++) {
      jsHub.bind(boundEvents[i], metadata);
    }

    // lifecycle notification
    jsHub.trigger("plugin-initialization-complete", metadata);

})();
/**
 * Fire the page lifecycle events when the page has loaded.
 * 
 * Contains DOMContentLoaded code by Dean Edwards / Matthias Miller / John Resig
 * http://dean.edwards.name/weblog/2006/06/again/
 * http://javascript.nwbox.com/IEContentLoaded/
 * 
 * @module load-triggers
 */
/*--------------------------------------------------------------------------*/

// JSLint options
/*global jsHub */
"use strict";

(function () {

  var timer = null, doc = document;

  function triggerPageLoadEvents() {
    // Initialise lifecycle triggers
    jsHub.logger.info("Triggering page lifecycle events");
    
    // Don't fire the events more than once
    if (triggerPageLoadEvents.done) {
      return;
    }
    triggerPageLoadEvents.done = true;
    if (timer) {
      clearInterval(timer);
    }
    
    // Can be used to pre-configure data at page level if necessary
    jsHub.trigger("data-capture-start");
    
    // Data is ready to be parsed by Data Capture plugins
    jsHub.trigger("page-view");
    
    // Data capture phase is complete
    jsHub.trigger("data-capture-complete");
  }
  
  if (doc.addEventListener) {
    /* for Mozilla / Opera9 */
    doc.addEventListener("DOMContentLoaded", triggerPageLoadEvents, false);
    
  } else if (doc.attachEvent) {
    /* for Internet Explorer */
    doc.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = doc.getElementById("__ie_onload");
    script.onreadystatechange = function () {
      if (this.readyState === "complete") {
        triggerPageLoadEvents();
      }
    };
  
  } else if (/WebKit/i.test(navigator.userAgent)) {
    /* for older Safari */
    timer = setInterval(function () {
      if (/loaded|complete/.test(doc.readyState)) {
        triggerPageLoadEvents();
      }
    }, 50);
  }
  
})();




// Configuration
jsHub.configure("inspector", {
	"Version" : "0.4",
  "Generator" : "http://fiann.local/configurator/tag_configurations/1",
  "Configuration" : "Demo site (revision 13, debug)"
});
jsHub.configure("causata-transport", {"server": "test.causata.com/rtw"});
jsHub.configure("samples-google-analytics-markup", {});
jsHub.configure("microformats-api", {});

