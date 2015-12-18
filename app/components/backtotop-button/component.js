import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  tag: 'div',
  classNames: ['backtotop-button-wrapper'],
  scrollElementSelector: null,
  showButtonAt: 1000,
  'tabbar-height': 55,

  uiEvents: [
    {
      eventName: 'scroll',
      callbackName: 'checkScroll',
      selectorFunction: 'getScrollSelectorToWatch',
    }
  ],
  
  setup: Ember.on('didInsertElement', function(){
    
    this.get('EventBus').subscribe('fixedItemsShift', this, this.updatePosition);
    this.updatePosition();
    this.$().hide();
    this.set('previousPath',this.get('currentPath'));
    
    /*let self = this;
    window.setInterval(function(){
      log(self.get('currentPath'));
    },1000);*/
    
  }),

  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('EventBus').unsubscribe('fixedItemsShift', this, this.updatePosition);
    
  }),
  
  pathRoot(){
    return this.get('currentPath').split('.')[0];
  },
  
  didUpdateAttrs(options){
    if(options.newAttrs.currentPath.value !== options.oldAttrs.currentPath.value){
    
      this.detectRouteChange();
      
    }
  },
  
  detectRouteChange(){
    if(this.get('currentPath') !== this.get('previousPath')){
      this.hideButton();
      this.set('previousPath',this.get('currentPath'));
    }
  },
  
  updatePosition(newPos={x:0,y:0}, duration=400) {
    
    var normalBottom = parseInt(Ember.Blackout.getCSSValue('bottom','backtotop-button-wrapper'));
    
    // Check if tab-bar is hidden
    if(!$('#nav-tabbar:visible').length){
      normalBottom -= this.get('tabbar-height');
    }
    
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
        
        Ember.$(scrollSelector).animate({ scrollTop: 0 }, 777, 'easeOutExpo', function () {
          self.set('isScrolling',false);
        });
        
        self.set('isScrolling',true);
        
        self.hideButton();
        
      }
      
    },
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
        //print(e);
      }
      
      if(!isNaN(scrollTop) && scrollTop>=threshold+50){
        this.showButton();
      } else if(!isNaN(scrollTop) && scrollTop<threshold){
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
