import Ember from 'ember';

export default Ember.Component.extend({
  tag: 'div',
  classNames: ['backtotop-button-wrapper'],
  scrollElementSelector: null,
  showButtonAt: 1000,

  uiEvents: [
    {
      eventName: 'scroll',
      callbackName: 'checkScroll',
      selectorFunction: 'getScrollSelectorToWatch',
    }
  ],
  
  setup: Ember.on('didInsertElement', function(){
    
    this.get('EventBus').subscribe('fixedItemsShift', this, this.updatePosition);
    this.$().hide();
    
  }),

  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('EventBus').unsubscribe('fixedItemsShift', this, this.updatePosition);
    
  }),
  
  updatePosition(newPos, duration) {
    
    var normalBottom = parseInt(Ember.Blackout.getCSSValue('bottom','backtotop-button-wrapper'));
    
    this.$().css({
      'transition': 'bottom '+duration+'ms',
      'bottom': (normalBottom-newPos.y)+'px',
    });
    
  },
  
  hideButton() {
    if(this.get('buttonIsShowing')){
      this.$().fadeOut();
      this.set('buttonIsShowing',false);
    }
  },
  
  showButton() {
    if(!this.get('buttonIsShowing')){
      this.$().fadeIn();
      this.set('buttonIsShowing',true);
    }
  },
  
  actions: {
    scrollToTop() {
      var self = this;
      
      if(!this.get('isScrolling')){
        
        var scrollSelector = this.getScrollSelector();
        
        if(!scrollSelector){
          if (window.features.lockBody) {
            scrollSelector = '#nav-body';
          } else {
            scrollSelector = 'html,body';
          }
        }
        
        Ember.$(scrollSelector).animate({ scrollTop: 0 }, 'slow', function () {
          self.set('isScrolling',false);
        });
        
        self.set('isScrolling',true);
        
        self.hideButton();
        
      }
      
    }
  },
  
  checkScroll(e) {
    
    var threshold = this.get('showButtonAt');
    
    if(e.target && !this.get('isScrolling')){
      
      var scrollTop;
      if(typeof(e.target.scrollTop)!=='undefined'){
        scrollTop = e.target.scrollTop;
      } else if(e.target.scrollingElement && typeof(e.target.scrollingElement.scrollTop)!=='undefined') {
        scrollTop = e.target.scrollingElement.scrollTop;
      } else {
        print(e);
      }
      
      if(scrollTop && scrollTop>=threshold+50){
        this.showButton();
      } else if(scrollTop && scrollTop<threshold){
        this.hideButton();
      }
      
    }
    
  },
  
  getScrollSelectorToWatch() {
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
  
});
