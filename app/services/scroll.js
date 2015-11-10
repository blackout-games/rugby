import Ember from 'ember';
const { $ } = Ember;

/**
 * Scroll helper
 * Scrolls body by default
 * 
 * READ THIS:
 * Consider using the scroll-to component helper. It's more well tested, and allows for scroll animation to be interrupted.
 * 
 */

export default Ember.Service.extend({
  
  scrollElementSelector: null,
  
  /**
   * This returns the selector for the item when you need to manipulate the page scroll position
   */
  getScrollSelector() {
    var scrollSelector = this.get('scrollElementSelector');
    
    if(!scrollSelector){
      if (window.features.lockBody) {
        scrollSelector = '#nav-body';
      } else {
        scrollSelector = 'html,body';
      }
    }
    
    return scrollSelector;
  },
  
  /**
   * This returns a selector when you need to get events when the page is scrolled
   */
  getScrollEventsSelector() {
    var scrollSelector = this.get('scrollElementSelector');
    
    if(!scrollSelector){
      if (window.features.lockBody) {
        scrollSelector = '#nav-body';
      } else {
        scrollSelector = window;
      }
    }
    
    return scrollSelector;
  },
  
  /**
   * Scroll to the given position (if int) or to the top of the given element (if selector)
   * @param  {Number or Selector} scrollPosOrSelector 
   */
  scrollTo( scrollPosOrSelector=0 ) {
    var self = this;
    var scrollTop;
    
    if(!this.get('isScrolling')){
      
      // Determine scroll position
      if(isNaN(scrollPosOrSelector)){
        scrollTop = $(scrollPosOrSelector).position().top;
        
        if (window.features.lockBody) {
          scrollTop += $('#nav-body').scrollTop();
        }
        
      } else {
        scrollTop = scrollPosOrSelector;
      }
      
      let scrollSelector = this.getScrollSelector();
      
      if(!scrollSelector){
        if (window.features.lockBody) {
          scrollSelector = '#nav-body';
        } else {
          scrollSelector = 'html,body';
        }
      }
      
      Ember.$(scrollSelector).animate({ scrollTop: scrollTop }, 777, 'easeOutExpo', function () {
        self.set('isScrolling',false);
      });
      
      self.set('isScrolling',true);
      
    }
    
  },
  
});
