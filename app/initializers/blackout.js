/**
 * Adds helper functions for Blackout apps to Ember.Blackout
 */

class Blackout {
  
  rand( min, max ){
    return Math.floor((Math.random() * (max-min+1)) + min)
  }
  
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
  
  getCSSValue (prop, fromClass) {

    var inspector = $("<div>").css('display', 'none').addClass(fromClass);
    $("body").append(inspector); // add to DOM, in order to read the CSS property
    try {
      return inspector.css(prop);
    } finally {
      inspector.remove(); // and remove from DOM
    }
    
  }
  
}

export function initialize(/*container, application*/) {
  // application.inject('route', 'foo', 'service:foo');
  Ember.Blackout = new Blackout();
}

export default {
  name: 'blackout',
  initialize: initialize
};
