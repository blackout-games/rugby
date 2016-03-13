import Ember from 'ember';

export default Ember.Mixin.create({
  windowBlur: Ember.inject.service('blur'),
  
  inactiveTime: 111,
  //minScrollNeeded: 777,
  minScrollNeeded: 0,
  canRememberScroll: false,
  
  /**
   * Set this in a consuming route to prevent scroll from being remembered when the route is loaded
   * @type {Boolean}
   */
  disableRememberScroll: true,
  
  /**
   * Set this in a consuming route to prevent scroll from being reset to top when the route is loaded
   * @type {Boolean}
   */
  noScrollReset: false,
  
  scrollSelector: Ember.computed(function(){
    if( window.features.lockBody ){
      return '#nav-body';
    } else {
      return window;
    }
  }),
  
  rememberScroll() {
    this.set('canRememberScroll',true);
  },
  
  setupRememberScroll: Ember.on('activate', function() {
    
    var self = this;
    
    if( !this.get('disableRememberScroll') && this.get('lastScroll') && Date.now() - this.get('lastScrollTime') < this.get('inactiveTime')*1000 && this.get('windowBlur').lastBlurTime() < this.get('lastScrollTime') && self.get('lastScroll') >= this.get('minScrollNeeded') ){
      
      Ember.run.next(function(){
        Ember.$(self.get('scrollSelector')).scrollTop(self.get('lastScroll'));
      });
      Ember.$(self.get('scrollSelector')).scrollTop(self.get('lastScroll'));
      
    } else {
      
      if(!this.get('noScrollReset')){
        Ember.run.next(function(){
          Ember.$(self.get('scrollSelector')).scrollTop(0);
        });
        Ember.$(self.get('scrollSelector')).scrollTop(0);
      }
      
    }
    
  }),
  
  cleanupRememberScroll: Ember.on('deactivate', function() {
    
    this.set('lastScroll',Ember.$(this.get('scrollSelector')).scrollTop());
    this.set('lastScrollTime',Date.now());
    
  }),
  
});
