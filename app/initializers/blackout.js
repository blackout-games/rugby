import Ember from 'ember';
var  E = Ember;
var  $ = E.$;

class Blackout {
  
  /**
   * Rand function which mimic's PHP's rand function
   * @param  {number} min The minimum number to return
   * @param  {number} max The maximum number to return
   * @return {number}     The random number.
   */
  rand( min, max ){
    return Math.floor((Math.random() * (max-min+1)) + min);
  }
  
  /**
   * Shuffles an array
   * @param  {array} array The array to shuffle.
   * @return {array}       The shuffled array.
   */
  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

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
  getCSSValue (prop, fromClass) {

    var inspector = $("<div>").css('display', 'none').addClass(fromClass);
    $("body").append(inspector); // add to DOM, in order to read the CSS property
    try {
      return this.trimChar( inspector.css(prop), '\"' );
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
  trimChar (string, charToRemove) {
    
    while(string.charAt(0)===charToRemove) {
        string = string.substring(1);
    }

    while(string.charAt(string.length-1)===charToRemove) {
        string = string.substring(0,string.length-1);
    }

    return string;
  }
  
  /**
   * Updates the URL hash without triggering scroll
   * @param  {string} hash The new hash
   * @return {null}      
   */
  updateHashQuietly ( hash ) {
    
    hash = hash.replace( /^#/, '' );
    var fx, node = $( '#' + hash );
    if ( node.length ) {
      node.attr( 'id', '' );
      fx = $( '<div></div>' )
              .css({
                  position:'absolute',
                  visibility:'hidden',
                  top: $(document).scrollTop() + 'px'
              })
              .attr( 'id', hash )
              .appendTo( document.body );
    }
    document.location.hash = hash;
    if ( node.length ) {
      fx.remove();
      node.attr( 'id', hash );
    }
    
  }
  
  /**
   * If we're currently in responsive small mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isSmallMode( obj ) {
    return obj.get('media.isMobile');
  }
  
  /**
   * If we're currently in responsive big mode
   * @param  {Ember obj}  obj The current ember object with media injected, i.e. routes, controllers, components (this)
   * @return {Boolean}
   */
  isBigMode( obj ) {
    return !obj.get('media.isMobile');
  }
  
  /**
   * Preloads an array of image paths, calls callback when they have loaded. Uses the imagesloaded plugin to handle browser quirks.
   * @param  {array}   sources  An array of image paths
   * @param  {Function} callback Function to call once images have loaded
   * NEEDS TESTING
   */
  preloadImages (sources, callback) {
    if(sources.length) {
      var preloaderDiv = $('<div style="display: none;"></div>').prependTo(document.body).data('completed',0);

      $.each(sources, function(i,source) {
        var img = $("<img/>").attr("src", source).appendTo(preloaderDiv);

        if(i === (sources.length-1)) {
          img.load(function() {
            preloaderDiv.data('completed',preloaderDiv.data('completed')+1);
            $(this).remove();
            if(preloaderDiv.data('completed') === sources.length && callback){
              preloaderDiv.remove();
              callback();
            }
          });
        }
      });
    } else {
      if(callback){
        callback();
      }
    }
  }
  
  /**
   * Preloads an image, calls callback when loaded.
   * @param  {array}   path  Path to the image
   * @param  {Function} callback Function to call once images have loaded
   */
  preloadImage( path, callback ){
    var img = $('<img src="'+path+'" />');
    img.load(function() {
      $(this).remove();
      if(callback){
        callback();
      }
    });
  }
  
  log ( entry ) {
    if ($('#console').length===0 ){
      
      // Create console viewport
      $('body').prepend('<div id="console"></div>');
      
      $('#console').perfectScrollbar({
          suppressScrollX: true,
      });
      
      Ember.$(window).on('resize', $('#console').perfectScrollbar('update'));
      
    }
    
    $('#console').append('<div class="console-entry"><span class="console-date">' + Date.now() + ' > </span>' + entry + '</div>').scrollTop($('#console')[0].scrollHeight);
  }
  
}

export function initialize(/*container, application*/) {
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
 * Misc shims
 */

// Fix date.now in IE8-
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
}

/**
 * Jeremy's minimal os and browser detections
 * Add as needed
 */
window.features = {};
window.features.lockBody = /crios/i.test(navigator.userAgent); // Chrome on iOS
//window.features.lockBody = false;

/**
 * Jeremy's print, so we don't have to type console.log
 */
window.print = console.log.bind( console );


/**
 * Add functionality to the ember view class to manage hover states manually by applying a .hover class to .btn elements whenever a new section is rendered.
 * 
 * We do this so that we can do hovers on mobile properly (as opposed to the browser default for :hover which is to leave the hover state sticky after touch)
 * 
 * If you find yourself trying to just use :active, and/or :focus to remove hover state on mobile - the reason that doesn't work is because on desktop we then end up with buttons that lose hover state after a click. This is bad for buttons like the menu button which stay in place on screen.
 */
Ember.View.reopen({
  didInsertElement : function(){
    this._super();
    Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
  },
  afterRenderEvent : function(){
    
    Ember.run.once('afterRender', this.setupWatchers, this);
    
  },
  
  setupWatchers: function( self ){
    
    // Hover
    Ember.$('body').find('.btn').off('mouseenter touchstart',null,self,self.hover);
    Ember.$('body').find('.btn').on('mouseenter touchstart',null,self,self.hover);
    
    // Leave
    Ember.$('body').find('.btn').off('mouseleave touchend',null,self,self.leave);
    Ember.$('body').find('.btn').on('mouseleave touchend',null,self,self.leave);
    
  },
  
  hover: function(e){
    
    //log('hover > ' + e.type);
    
    var self = e.data;
    if( !self.get('endEvent')
      
        || (self.get('endEvent') === 'touchend'
          && e.type === 'touchstart')
      
        || (self.get('endEvent') === 'mouseleave'
          && e.type === 'mouseenter') ){
      
      if( !self.get('startEvent') ){
        self.set('startEvent',e.type);
      }
      
      if(e.type === 'touchstart'){
        $(this).addClass('press');
      } else {
        $(this).addClass('hover');
      }
      
    }
    
  },
  
  leave: function(e){
    
    //log('leave > ' + e.type);
    
    var self = e.data;
    if( !self.get('startEvent')
      
        || (self.get('startEvent') === 'touchstart'
          && e.type === 'touchend')
      
        || (self.get('startEvent') === 'mouseenter'
          && e.type === 'mouseleave') ){
      
      if( !self.get('endEvent') ){
        self.set('endEvent',e.type);
      }
      
      $(this).removeClass('press hover');
      
    }
  },
  
});