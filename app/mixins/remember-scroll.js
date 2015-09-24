import Ember from 'ember';

export default Ember.Mixin.create({
  windowBlur: Ember.inject.service('blur'),
  
  inactiveTime: 111,
  //minScrollNeeded: 777,
  minScrollNeeded: 0,
  canRemember: false,
  
  scrollSelector: function(){
    if( window.features.lockBody ){
      return '#nav-body';
    } else {
      return window;
    }
  }.property(),
  
  rememberScroll: function(){
    this.set('canRemember',true);
  },
  
  setupRememberScroll: function() {
    
    var self = this;
    
    if( this.get('canRemember') && this.get('lastScroll') && Date.now() - this.get('lastScrollTime') < this.get('inactiveTime')*1000 && this.get('windowBlur').lastBlurTime() < this.get('lastScrollTime') && self.get('lastScroll') >= this.get('minScrollNeeded') ){
      
      Ember.run.next(function(){
        Ember.$(self.get('scrollSelector')).scrollTop(self.get('lastScroll'));
      });
      
    } else {
      
      Ember.run.next(function(){
        Ember.$(self.get('scrollSelector')).scrollTop(0);
      });
      
    }
    
  }.on('activate'),
  
  cleanupRememberScroll: function() {
    
    this.set('lastScroll',Ember.$(this.get('scrollSelector')).scrollTop());
    this.set('lastScrollTime',Date.now());
    
  }.on('deactivate'),
  
});
