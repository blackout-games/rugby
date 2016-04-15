import Ember from 'ember';

/**
 * Two classes need to be provided, one for the wrapper, and one for the scroller
 * 
 * BOTH MUST CONTAIN THE SAME WIDTH
 * 
 * This allows this to work in Firefox
 * 
 * e.g.

    .wrapper {
      width:97vw;
      max-width:400px;
    }

    .scroller {
      width:97vw;
      max-width:400px;
    }

 * 
 */

export default Ember.Component.extend({
  
  /**
   * Pass through classes to scroller
   * @type {String}
   */
  scrollerClass: '',
  
});
