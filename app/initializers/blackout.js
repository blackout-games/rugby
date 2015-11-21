import Ember from 'ember';
import config from '../config/environment';
var E = Ember;
var $ = E.$;

class Blackout {
  
  /**
   * This fills the gap where sometimes we need to wait for a promise to resolve, but we're already in the view layer which isn't promise aware (i.e. helpers).
   * 
   * Give this function a potential promise and a callback function which receives the resolved item, builds and returns the real HTML.
   * 
   * Optionally provide an event name too (listens from eventbus), and the html will be replaced again any time this event is broadcast. This supports areas like helpers with i18n because the i18n 't' component caches helper output meaning when the locale gets changed, the html is returned to the initial holder html we return from this function.
   * 
   * This function returns a basic html wrapper with an id, which will be filled with your provided html when the promise resolves.
   * 
   * @param  {object} potentialPromise A potential promise like what you would provide to assertPromise()
   * @param  {object} potentialPromise 
   * @return {string}  HTML object which will be filled when the promise resolves
   */
  promiseHTML( potentialPromise, callback, eventName=null ){
    
    // Generate an id (promise placeholder)
    let id = 'blackout-pp-' + this.generateId();
    let self = this;
    let eventBus = self.App.lookup('service:event-bus');
    
    // Run the promise
    this.assertPromise( potentialPromise ).then(function(data){
      
      let watcher = () => {
        Ember.run.next(() => {
          
          // Must generate html from callback again so that updaters get run e.g. see manager helper
          let html = callback(data);
          let $holder = $('#'+id);
          
          if($holder.length){
            $holder.html(html);
          } else if(eventName) {
            print('destoryed');
            eventBus.unsubscribe(eventName,watcher);
          }
          
        });
      };
      
      watcher();
      
      if(eventName){
        
        // Listen for the given event name, and on publishing of this event, we update the html again.
        
        eventBus.subscribe(eventName,watcher);
        
      }
      
    });
    
    // Return placeholder html
    return '<span id="' + id + '"></span>';
    
  }
  
  /**
   * Ensures whatever is passed in, even if not a promise, is turned into a promise. This allows us to process data returned by ember data which may not have resolved yet, i.e. a relationship. We can then process the data in only one place, whereas checking is something is a promise can result in code being repeated
   * 
   * Use: assertPromise( potentialPromise ).then( function(data){ // Process } )
   *  
   * @param  {object} potentialPromise Generally something passed in from ember data, e.g. in a template 
   * @return {promise}  A promise
   */
  assertPromise( potentialPromise ){
    
    return new Ember.RSVP.Promise(function(resolve) {
      
      // Check for array of items
      let data;
      if(Ember.isArray(potentialPromise)){
        data = potentialPromise.get('firstObject');
      } else {
        data = potentialPromise;
      }
      
      // Check for promise
      let type = Ember.inspect(data);
      
      if(type.indexOf('DS.PromiseObject')>=0){
        
        data.then(function(data){
          resolve(data);
        });
        
      } else {
        
        // Not a promise
        resolve(data);
        
      }
      
    });
    
  }
  
  /**
   * Converts htmlBars.safeString to normal string if applicable
   * @param {stringy} maybeStr Anything really.
   */
  String( maybeStr ){
    
    if(typeof(maybeStr)==='string'){
      
      return maybeStr;
      
    // Check for safestring
    // http://emberjs.com/api/classes/Ember.String.html#method_htmlSafe
    } else if(typeof(maybeStr)==='object' && maybeStr.toString){
      
      return maybeStr.toString();
      
    } else {
      return null;
    }
    
  }
  
  /**
   * Same as Ember.isEmpty, except also supports options attributes passed to didUpdateAttrs
   * @param  {any}  item Item to check if empty
   * @return {Boolean}
   */
  isEmpty( item ) {
    
    if(typeof(item)==='object' && "value" in item && item.value===undefined){
      return true;
    } else {
      return Ember.isEmpty(item);
    }
    
  }

  /**
   * Rand function which mimic's PHP's rand function
   * @param  {number} min The minimum number to return
   * @param  {number} max The maximum number to return
   * @return {number}     The random number.
   */
  rand(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
  }

  generateId(len = 5) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  /**
   * Shuffles an array
   * @param  {array} array The array to shuffle.
   * @return {array}       The shuffled array.
   */
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  /**
   * Gets the value of a CSS property based on a class that hasn't been used yet (if it's been used you can just read the property using $.css() ).
   * @param  {string} prop             The CSS property for the value you want.
   * @param  {string} classOrjQueryObj The CSS class containing the property.
   * @return {string}                  The CSS value.
   */
  getCSSValue(prop, className) {
    
    var inspector = $("<div>").css('display', 'none').addClass(className);
    $("body").append(inspector); // add to DOM, in order to read the CSS property
    try {
      return this.trimChar(inspector.css(prop), '\"');
    } finally {
      inspector.remove(); // and remove from DOM
    }

  }

  /**
   * Gets the value of a CSS pseudo property based on a class.
   * @param  {string} prop             The CSS property for the value you want.
   * @param  {string} classOrjQueryObj The CSS class containing the pseudo property, or a jquery element with the class already applied.
   * @return {string}                  The pseudo CSS value.
   */
  getCSSPseudoValue(prop, classOrjQueryObj, pseudoSelector=':before') {

    var inspector;
    
    if(typeof(classOrjQueryObj)==='string'){
      
      // Note cannot use display: none, otherwise it doesn't work on safari
      
      inspector = $("<div>").css('visibility', 'hidden').addClass(classOrjQueryObj);
      
      $("body").append(inspector); // add to DOM, in order to read the CSS property
    } else {
      inspector = classOrjQueryObj;
    }
    
    try {
      
      return window.getComputedStyle(inspector[0], pseudoSelector).getPropertyValue(prop);
    } finally {
      if(typeof(classOrjQueryObj)==='string'){
        inspector.remove(); // and remove from DOM
      }
    }

  }
  
  /**
   * Allows us to manipulate pseudo rules
   * @param {string} selector CSS selector, i.e. .some-class:before
   * @param {string} css      CSS rules, i.e. background-image: url(...); ...
   * @param {number} index    An integer index for the rule
   * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
   */
  addCSSRule(selector,css,index=0) {
    document.styleSheets[0].addRule(selector,css);
    document.styleSheets[0].insertRule(selector + ' { ' + css + ' }',index);
  }
  
  /**
   * Allows us to remove a previously added pseudo rule
   * @param {number} index    An integer index for the rule to delete
   * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
   */
  deleteCSSRule(index) {
    document.styleSheets[0].deleteRule(index);
  }

  /**
   * trimChar
   * @param  {string} string       String to trim
   * @param  {char} charToRemove   The character to trim
   * @return {string}              Trimmed string
   */
  trimChar(string, charToRemove) {

    while (string.charAt(0) === charToRemove) {
      string = string.substring(1);
    }

    while (string.charAt(string.length - 1) === charToRemove) {
      string = string.substring(0, string.length - 1);
    }

    return string;
  }
  
  /**
   * Remove all newlines \n
   * @param  {string} string The string to strip
   * @return {string}        The trimmed string
   */
  stripNewlines(string){
    return string.trim().replace(/\r?\n|\r?/g,"");
  }
  
  /**
   * Trim all html <br> (and variants) along with whitespace
   * Also replaces any inline breaks with <br> instead of variants
   * @param  {string} string The string to trim
   * @return {string}        The trimmed string
   */
  trimBr(string){
    return string.replace(/ *<br ?\/?> */gi,'<br>').replace(/(^([\.\-\_\=\#\*\{\}\[\]\,\\\/]|<br>)*|(<br>)*$)/gi, "").trim();
  }
  
  /**
   * Convert a <br> based string into <p> where appropriate.
   * @param  {string} string The string to convert
   * @return {string}        The converted string
   */
  br2p(string){
    return '<p>' + string.replace(/(?:<br\s*\/?>\s*?){2,}/gi, '</p><p>') + '</p>';
  }
  
  /**
   * Convert a <br> based string into \n where appropriate.
   * @param  {string} string The string to convert
   * @return {string}        The converted string
   */
  br2nl(string){
    return string.replace(/(?:<br\s*\/?>\s*?){2,}/gi, "\n");
  }

  /**
   * Updates the URL hash without triggering scroll
   * @param  {string} hash The new hash
   * @return {null}      
   */
  updateHashQuietly(hash) {

    hash = hash.replace(/^#/, '');
    var fx, node = $('#' + hash);
    if (node.length) {
      node.attr('id', '');
      fx = $('<div></div>')
        .css({
          position: 'absolute',
          visibility: 'hidden',
          top: $(document).scrollTop() + 'px'
        })
        .attr('id', hash)
        .appendTo(document.body);
    }
    document.location.hash = hash;
    if (node.length) {
      fx.remove();
      node.attr('id', hash);
    }

  }
  
  /**
   * Encode any oldstyle characters.
   */
  encodeOldStyleChars(str){
      
    return str.replace(/\[/g,'&#91;');
    
  }
  
  /**
   * Decode any oldstyle characters.
   */
  decodeOldstyleChars(str){
    
    return str.replace(/&#91;/g,'[');
    
  }
  
  /**
   * The point of this isn't to find and format code (the main markdown parser will do that).
   * Here we just need to encode any markdown characters within code blocks so that they don't get picked up by our custom markdown parsing stuff.
   */
  encodeMarkdownCode(markdown){
    
    return markdown.replace(/```([^`]*)```|`([^`\n]*)`/g,function( fullMatch, codeBlock, inlineCode){
      
      if(codeBlock){
        return '```' + codeBlock.encodeMarkdownChars() + '```';
      } else if(inlineCode){
        return '`' + inlineCode.encodeMarkdownChars() + '`';
      } else {
        return fullMatch;
      }
      
    });
    
  }
  
  /**
   * Converts old style format tags like [b][/b] to markdown.
   * @param  {string} str The string to convert
   * @return {string}     The markdown string
   */
  toMarkdown(str){
    
    let self = this;
    
    // ------------------------------------------- Pre-code
    
    // We must process code blocks that are already markdown to ensure they won't be touched either.
    
    str = str.replace(/```([^`]*)```|`([^`\n]*)`/g,function( fullMatch, codeBlock, inlineCode){
      
      if(codeBlock){
        return '```' + self.encodeOldStyleChars(codeBlock) + '```';
      } else if(inlineCode){
        return '`' + self.encodeOldStyleChars(inlineCode) + '`';
      } else {
        return fullMatch;
      }
      
    });
    
    // ------------------------------------------- Code
    
    str = str.replace(/\[(i?code)\]((.|[\r\n?])*?)\[\/i?code\]/g,function(fullMatch,tag,code){
      
      if(tag==='icode'){
        return '`' + self.encodeOldStyleChars(code) + '`';
      } else {
        return '```' + "\n" + self.encodeOldStyleChars(code) + "\n" + '```';
      }
      
    });
    
    // ------------------------------------------- Bold
    
    str = str.replace(/\[b\]((.|[\r\n?])*?)\[\/b\]/g,function(fullMatch,text){
      return '**' + text + '**';
    });
    
    // ------------------------------------------- Italic
    
    str = str.replace(/\[i\]((.|[\r\n?])*?)\[\/i\]/g,function(fullMatch,text){
      return '*' + text + '*';
    });
    
    // ------------------------------------------- Striked
    
    str = str.replace(/\[t\]((.|[\r\n?])*?)\[\/t\]/g,function(fullMatch,text){
      return '~~' + text + '~~';
    });
    
    // ------------------------------------------- Underline
    
    str = str.replace(/\[u\]((.|[\r\n?])*?)\[\/u\]/g,function(fullMatch,text){
      return text;
    });
    
    // ------------------------------------------- Underline
    
    str = str.replace(/\[u\]((.|[\r\n?])*?)\[\/u\]/g,function(fullMatch,text){
      
      return text;
      
    });
    
    // ------------------------------------------- Links
    
    str = str.replace(/\[(?:link|url)(?:=(.*?))?\](.*?)\[\/(?:link|url)\]/g,function(fullMatch,link,text){
      
      if(!link){
        link = text;
      }
      
      if(link.substr(0,1)==='!'){
        link = 'https://www.blackoutrugby.com/game/' + link.substr(1);
      }
      
      return '[' + text + '](' + link + ')';
      
    });
    
    // ------------------------------------------- Quotes
    
    str = str.replace(/\[quote(?:=(.*?))?\]((.|[\r\n?])*?)\[\/quote\]/g,function(fullMatch,quoteUser,quote){
      
      // Break into lines
      let lines = quote.split("\n");
      quote = '';
      
      // Process lines, adding '>' if not empty
      $.each(lines,function(i,line){
        
        // Add > if line is not empty
        if( line.trim() !== '' || i===0 ){
          
          // Add > and user to first line
          lines[i] = '> ' + (i===0&&quoteUser?'@['+quoteUser+'] ':'') + line;
          
        }
        
        // Add newline at end of line except the last line
        quote += lines[i] + (lines.length===i+1?"":"\n");
        
      });
      
      return quote;
      
    });
    
    // Decode any oldstyle chars
    str = this.decodeOldstyleChars(str);
    
    return str;
    
  }
  
  assertURL(url) {
    
    if( url.search(/\/\/[^\/]|https?:\/\/|ftps?:\/\/|mailto:/) !== 0 ){
      url = '//' + url;
    }
    return url;
    
  }

  /**
   * If we're currently in responsive small mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isSmallMode(obj) {
    return obj.get('media.isMobile');
  }

  /**
   * If we're currently in responsive big mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isBigMode(obj) {
    return !obj.get('media.isMobile');
  }

  /**
   * Preloads an array of image paths, calls callback when they have loaded. Uses the imagesloaded plugin to handle browser quirks.
   * @param  {array}   sources  An array of image paths
   * @param  {Function} callback Function to call once images have loaded
   * NEEDS TESTING
   */
  preloadImages(sources, callback) {
    if (sources.length) {
      var preloaderDiv = $('<div style="display: none;"></div>').prependTo(document.body).data('completed', 0);

      $.each(sources, function(i, source) {
        var img = $("<img/>").attr("src", source).appendTo(preloaderDiv);

        if (i === (sources.length - 1)) {
          img.load(function() {
            preloaderDiv.data('completed', preloaderDiv.data('completed') + 1);
            $(this).remove();
            if (preloaderDiv.data('completed') === sources.length && callback) {
              preloaderDiv.remove();
              callback();
            }
          });
        }
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  /**
   * Preloads an image, calls callback when loaded.
   * @param  {array}   path  Path to the image
   * @param  {Function} callback Function to call once images have loaded
   */
  preloadImage(path, callback, errorCallback=null) {
    var img = $('<img src="' + path + '" />');
    img.on('load',function() {
      $(this).remove();
      if (callback) {
        callback(this.width,this.height);
      }
    }).on('error', function() {
      if(errorCallback){
        errorCallback();
      }
    });
  }
  
  /**
   * Pass a jquery item to this function to have it fade in
   * Uses animate.css library
   * @param  {jquery object} $jqueryItem The item to fade in
   */
  fadeIn($jqueryItem){
    $jqueryItem.addClass('animated fadeIn');
  }
  
  /**
   * Logs a string, or strings to a visible on screen console (helpful for debugging on mobile)
   */
  log() {
    if ($('#console').length === 0) {

      // Create console viewport
      $('body').prepend('<div id="console"></div>');

      /*
      $('#console').perfectScrollbar({
        suppressScrollX: true,
      });
      */

      Ember.$(window).on('resize', Ember.run.bind(this, function() {
        //$('#console').perfectScrollbar('update');
      }));

    }

    var args = Array.prototype.slice.call(arguments);
    var entry = args.join(', ');

    $('#console').append('<div class="console-entry"><span class="console-date">' + Date.now() + ' > </span>' + entry + '</div>').scrollTop($('#console')[0].scrollHeight);
  }

  /**
   * Find out if element is in a fixed position = ''
   * @param  {element} element Element to check
   * @return {boolean}
   */
  elementOrParentIsFixed(element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isFixed = false;
    $checkElements.each(function() {
      if ($(this).css("position") === "fixed") {
        isFixed = true;
        return false;
      }
    });
    return isFixed;
  }
  
  /**
   * Deprecated. Youth names are generated at API level to allow for future feature allowing renaming of youth clubs
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  juniorClubName(name){
    Ember.Logger.warn('juniorClubName() deprecated. Youth names are generated at API level');
    return 'Jr ' + name;
  }

}

/**
 * A global store for all your stuff
 * @type {Object}
 */
Blackout.prototype.store = {

  /**
   * jQuery event string for css animation end detection
   * @type {String}
   */
  cssAnimationEndEvents: 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd',

};

export function initialize( /*application*/ ) {
  // application.inject('route', 'foo', 'service:foo');
  E.Blackout = new Blackout();

  /**
   * Shortcut to blackout console logging
   */
  window.log = E.Blackout.log;
}

export default {
  name: 'blackout',
  initialize: initialize
};

/**
 * Jeremy's print, so we don't have to type console.log
 */
window.print = console.log.bind(console);

/**
 * Misc shims
 */

// Fix date.now in IE8-
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  };
}

/**
 * Form context for debounces
 */
Ember.FormContext = {
  name: 'currentForm'
};

/**
 * Jeremy's blackout namespace (used elsewhere)
 */
window.blackout = {};

/**
 * Jeremy's minimal OS detection
 */
window.os = {};
window.os.iOS = navigator.userAgent.match( /iPad/i ) || navigator.userAgent.match( /iPhone/i ) || navigator.userAgent.match( /iPod/i );
window.os.android = navigator.userAgent.match( /Android/i );

/**
 * Jeremy's minimal browser detections
 */
window.browsers = {};
window.browsers.chromeiOS = /crios/i.test(navigator.userAgent);
window.browsers.safariOS = /(iPod|iPhone|iPad)/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !window.browsers.chromeiOS;


/**
 * Jeremy's minimal os and browser detections
 * Add as needed
 */
window.features = {};
//window.navigator.standalone = true;
window.features.canParallax = !window.os.iOS&&!window.os.android;
window.features.lockBody = window.browsers.safariOS && window.navigator.standalone;
//window.features.lockBody = true;


/**
 * Scroll body selector
 */
if(window.features.lockBody){
  window.features.lockBodyScroller = '#nav-body';
}



/**
 * String extensions
 */
String.prototype.ucFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

String.prototype.regexLastIndexOf = function(regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) === "undefined") {
        startpos = this.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    let result;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
};


  
String.prototype.rtrim = function(charlist) {
  //  discuss at: http://phpjs.org/functions/rtrim/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Erkekjetter
  //    input by: rem
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //   example 1: rtrim('    Kevin van Zonneveld    ');
  //   returns 1: '    Kevin van Zonneveld'
  var str = this;
  charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
  var re = new RegExp('[' + charlist + ']+$', 'g');
  
  return (str + '').replace(re, '');
};
  
/**
 * Replace a specified part of a string
 * @param  {string} str     The subject string to act upon
 * @param  {string} replace The new sub string
 * @param  {int} start      The start point in the subject string
 * @param  {int} length     The length of the subject string to replace
 * @return {string}         The new string
 * 
 * Discuss at: http://phpjs.org/functions/substr_replace/
 * Original by: Brett Zamir (http://brett-zamir.me)
 */
String.prototype.substrReplace = function(replace, start, length) {
  
  var str = this;
  if (start < 0) { // start position in str
    start = start + str.length;
  }
  length = length !== undefined ? length : str.length;
  if (length < 0) {
    length = length + str.length - start;
  }

  return str.slice(0, start) + replace.substr(0, length) + replace.slice(length) + str.slice(start + length);
};

String.prototype.stripMarkdown = function(options) {
  
  let md = this;
  options = options || {};
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : false;

  var output = md;
  try {
    if (options.stripListLeaders) {
      output = output.replace(/^([\s\t]*)([\*\-\+]|\d\.)\s+/gm, '$1');
    }
    output = output
      // Remove HTML tags
      .replace(/<(.*?)>/g, '$1')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
      .replace(/([\*_]{1,2})(\S.*?\S)\1/g, '$2')
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      .replace(/^-{3,}\s*$/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n{2,}/g, '\n\n');
  } catch(e) {
    console.error(e);
    return md;    
  }
  return output;
};

/**
 * Strips any non-alphanumeric characters
 */
String.prototype.alphaNumeric = function() {
  return this.replace(/[^a-zA-Z0-9]/g,'');
};

/**
 * Generate a hash integer from a string
 * (Faster than md5)
 */
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0){
    return hash;
  }
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Prepare a string id for use with API requests using a unique string instead of the normal number ID. Used for example, when reqiesting managers via their username
 * @return {string} The prepared string.
 */
String.prototype.pkString = function() {
  return this.toLowerCase().replace(/ /g,'_sp_');
};

/**
 * php.js version of str_replace
 * @param  {string|array} search  The string or array of strings to search for
 * @param  {string|array} replace The string or array of strings to use as replacements
 * @param  {number} count         Optional, Limit the replacements to this number
 * @return {string}               The final string.
 */
String.prototype.str_replace = function(search, replace, count) {

  let subject = this;

  var i = 0,
    j = 0,
    temp = '',
    repl = '',
    sl = 0,
    fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = Object.prototype.toString.call(r) === '[object Array]',
    sa = Object.prototype.toString.call(s) === '[object Array]';
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp)
        .split(f[j])
        .join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
};

/**
 * Encode any markdown special characters into html codes
 * @param  {boolean} decode Set to true to reverse the process
 * @return {string}         The encoded string
 */
String.prototype.encodeMarkdownChars = function(decode=false){
  
  let markdownChars = [
    '#', // must be first html etities have hash in them
    '*',
    '_',
    '~',
    '=',
    '[',
    ']',
    '(',
    ')',
    '>',
    '!',
    '@',
    '.',
    ':',
  ];
  
  let htmlCodes = [
    '&#35;', // #
    '&#42;', // *
    '&#95;', // _
    '&#126;', // ~
    '&#61;', // =
    '&#91;', // [
    '&#93;', // ]
    '&#40;', // (
    '&#41;', // )
    '&gt;', // >
    '&#33;', // !
    '&#64;', // @
    '&#46;', // .
    '&#58;', // :
  ];
  
  if(!decode){
    return this.str_replace(markdownChars,htmlCodes);
  } else {
    return this.str_replace(htmlCodes.reverse(),markdownChars.reverse());
  }
  
};

/**
 * Decode any markdown special characters
 * @return {string}         The encoded string
 */
String.prototype.decodeMarkdownChars = function(){
  
  return this.encodeMarkdownChars(true);
  
};





/**
 * Array extensions
 */

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) === -1) {
        this.push(item);
        return true;
    }
    return false;
}; 



/**
 * Add functionality to the ember view class to manage hover states manually by applying a .hover class to .btn elements whenever a new section is rendered.
 * 
 * We do this so that we can do hovers on mobile properly (as opposed to the browser default for :hover which is to leave the hover state sticky after touch)
 * 
 * If you find yourself trying to just use :active, and/or :focus to remove hover state on mobile - the reason that doesn't work is because on desktop we then end up with buttons that lose hover state after a click. This is bad for buttons like the menu button which stay in place on screen.
 */
Ember.Component.reopen({
  
  _scheduleHoverWatcher: Ember.on('didInsertElement', function() {
    
    //log('setup watchers');
    
    Ember.run.once('_refreshWatchers', _refreshWatchers );
    Ember.run.once('inlinizeSVG', _inlinizeSVG );

  }),

});

var _hoverStartEvent,_hoverEventObj,_hoverEndEvent;

function _refreshWatchers() {
  
  //log('refreshing watchers');
  
  // Hover
  Ember.$('body').find('.btn,.btn-a').off('mouseenter touchstart', _hover);
  Ember.$('body').find('.btn,.btn-a').on('mouseenter touchstart', _hover);

  // Leave
  Ember.$('body').find('.btn,.btn-a').off('mouseleave touchend', _leave);
  Ember.$('body').find('.btn,.btn-a').on('mouseleave touchend', _leave);
  
  // Click
  Ember.$('body').find('.btn').off('click', _click);
  Ember.$('body').find('.btn').on('click', _click);

}

function _hover (e) {

  //log('hover > ' + e.type);

  if (!_hoverEndEvent ||

    (_hoverEndEvent === 'touchend' &&
      e.type === 'touchstart') ||

    (_hoverEndEvent === 'mouseleave' &&
      e.type === 'mouseenter')) {
    
    // For determining touch screen
    if (!_hoverStartEvent) {
      _hoverStartEvent = e.type;
    }
    
    _hoverEventObj = e;

    if (e.type === 'touchstart') {
      $(this).addClass('press');
    } else {
      $(this).addClass('hover');
    }

  }
}

function _leave (e) {

  //log('leave > ' + e.type);

  if (!_hoverStartEvent ||

    (_hoverStartEvent === 'touchstart' &&
      e.type === 'touchend') ||

    (_hoverStartEvent === 'mouseenter' &&
      e.type === 'mouseleave')) {

    if (!_hoverEndEvent) {
      _hoverEndEvent = e.type;
    }

    $(this).removeClass('press hover');
    
    /**
     *   NOTICE: If CLICK events are not working, see the perfect scroll component
     */

  }
}

function _click () {
  
  // Remove focus after click so buttons don't just sit there in the 'focused' state event after clicking. e.e. login button > sidebar > home screen > desktop.
  $(this).blur();
  
}

/*
 * Replace all SVG images with inline SVG
 */
function _inlinizeSVG () {
  Ember.$('img.svg').each(function() {

    var $img = Ember.$(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgAlt = $img.attr('aria-label');
    var imgURL = $img.attr('src');
    var imgHost = config.assetFilesHost;
    //imgHost = 'https://s3.amazonaws.com/rugby-ember/';
    //imgHost = 'https://dah9mm7p1hhc3.cloudfront.net/';
    
    // Add cloudfront?
    if(imgURL.substr(0,4)!=='http'){
      $img.attr('src',imgHost + $img.attr('src'));
      imgURL = $img.attr('src');
    }
    
    // Add svg rebuilder as function
    var rebuildSVG = function(){
      
      if(!$img.data('hasLoadedSVG')){
        
        $.ajax({
          url: imgURL,
          headers: {
          },
          dataType: 'xml',
        }).then(function(data){ //---------------- Success
          
          $img.data('hasLoadedSVG',true);
          
          // Get the SVG tag, ignore the rest
          var $svg = Ember.$(data).find('svg');

          // Add replaced image's ID to the new SVG
          if (typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
          }
          // Add replaced image's classes to the new SVG
          if (typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass + ' replaced-svg');
          }
          // Add replaced image's alt text to the new SVG
          if (typeof imgAlt !== 'undefined') {
            $svg = $svg.attr('aria-label', imgAlt);
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          $svg = $svg.removeAttr('xmlns:a');

          // Replace image with new SVG
          $img.replaceWith($svg);
          
          if($img.data('ajaxCacheOff')){
            
            // Turn on cache
            $.ajaxSetup({ cache: true });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',false);
            
          }
          
        },function(/*xhr*/){ //---------------- Error
          
          if(!$img.data('ajaxCacheOff')){
            
            // Assume CORS issues from a cached SVG 
            // So we try again without cache
            
            
            // Turn off cache
            $.ajaxSetup({ cache: false });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',true);
            
            // Get SVG again
            rebuildSVG();
            
          } else {
            
            // Turn on cache
            $.ajaxSetup({ cache: true });
            
            // Track that cache has been turned off
            $img.data('ajaxCacheOff',false);
            
            // Don't go again
            
          }
          
        });
        
        
      }
      
      
    };
    
    rebuildSVG();

  });
}

/**
 * jQuery extensions
 */

(function($) {
  $.fn.findClosest = function(filter) {
    var $found = $(),
      $currentSet = this.children(); // Current place
    while ($currentSet.length) {
      $found = $currentSet.filter(filter);
      if ($found.length){
        break; // At least one match: break loop
      }
      // Get all children of the current set
      $currentSet = $currentSet.children();
    }
    return $found.first(); // Return first match of the collection
  };
})(Ember.$);