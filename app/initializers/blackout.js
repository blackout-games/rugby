import Ember from 'ember';
import config from '../config/environment';
var E = Ember;
var $ = E.$;

class Blackout {

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
   * Gets the value of a CSS property based on a class.
   * @param  {string} prop      The CSS property for the value you want.
   * @param  {string} fromClass The CSS class containing the property.
   * @return {string}           The CSS value.
   */
  getCSSValue(prop, fromClass) {

    var inspector = $("<div>").css('display', 'none').addClass(fromClass);
    $("body").append(inspector); // add to DOM, in order to read the CSS property
    try {
      return this.trimChar(inspector.css(prop), '\"');
    } finally {
      inspector.remove(); // and remove from DOM
    }

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
   * Trim all html <br> (and variants) along with whitespace
   * Also replaces any inline breaks with <br> instead of variants
   * @param  {string} string The string to trim
   * @return {string}        The trimmed string
   */
  trimBr(string){
    return string.trim().replace(/\r?\n|\r?/g,"").replace(/ *<br ?\/?> */gi,'<br>').replace(/(^([\.\-\_\=\#\*\{\}\[\]\,\\\/]|<br>)*|(<br>)*$)/gi, "").trim();
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
  preloadImage(path, callback) {
    var img = $('<img src="' + path + '" />');
    img.load(function() {
      $(this).remove();
      if (callback) {
        callback();
      }
    });
  }

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

export function initialize( /*container, application*/ ) {
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





/**
 * Add functionality to the ember view class to manage hover states manually by applying a .hover class to .btn elements whenever a new section is rendered.
 * 
 * We do this so that we can do hovers on mobile properly (as opposed to the browser default for :hover which is to leave the hover state sticky after touch)
 * 
 * If you find yourself trying to just use :active, and/or :focus to remove hover state on mobile - the reason that doesn't work is because on desktop we then end up with buttons that lose hover state after a click. This is bad for buttons like the menu button which stay in place on screen.
 */
Ember.Component.reopen({
  
  _scheduleHoverWatcher: function() {
    
    //log('setup watchers');
    
    Ember.run.once('_refreshWatchers', _refreshWatchers );
    Ember.run.once('inlinizeSVG', _inlinizeSVG );

  }.on('didInsertElement'),

});

var _hoverStartEvent,_hoverEndEvent;

function _refreshWatchers() {
  
  //log('refreshing watchers');
  
  // Hover
  Ember.$('body').find('.btn,.btn-a').off('mouseenter touchstart', _hover);
  Ember.$('body').find('.btn,.btn-a').on('mouseenter touchstart', _hover);

  // Leave
  Ember.$('body').find('.btn,.btn-a').off('mouseleave touchend', _leave);
  Ember.$('body').find('.btn,.btn-a').on('mouseleave touchend', _leave);

}

function _hover (e) {

  //log('hover > ' + e.type);

  if (!_hoverEndEvent ||

    (_hoverEndEvent === 'touchend' &&
      e.type === 'touchstart') ||

    (_hoverEndEvent === 'mouseleave' &&
      e.type === 'mouseenter')) {

    if (!_hoverStartEvent) {
      _hoverStartEvent = e.type;
    }

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

  }
}

/*
 * Replace all SVG images with inline SVG
 */
function _inlinizeSVG () {
  Ember.$('img.svg').each(function() {

    var $img = Ember.$(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
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
          
        },function(xhr){ //---------------- Error
          
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
      
      
    }
    
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
