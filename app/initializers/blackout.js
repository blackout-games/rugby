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
      return inspector.css(prop);
    } finally {
      inspector.remove(); // and remove from DOM
    }
    
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
  
  isSmallMode( obj ) {
    return obj.get('media.isMobile');
  }
  
  isBigMode( obj ) {
    return !obj.get('media.isMobile');
  }
  
}

export function initialize(/*container, application*/) {
  // application.inject('route', 'foo', 'service:foo');
  E.Blackout = new Blackout();
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
