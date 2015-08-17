import Ember from 'ember';

export default Ember.Mixin.create({
  windowBlur: Ember.inject.service('blur'),
  
  inactiveTime: 180,
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
  
  activate: function() {
    
    this._super.apply(this, arguments);
    var self = this;
    if( this.get('canRemember') && this.get('lastScroll') && Date.now() - this.get('lastScrollTime') < this.get('inactiveTime')*1000 && this.get('windowBlur').lastBlurTime() < this.get('lastScrollTime') ){
      
      Ember.run.next(function(){
        Ember.$(self.get('scrollSelector')).scrollTop(self.get('lastScroll'));
      });
      
    } else {
      
      Ember.run.next(function(){
        Ember.$(self.get('scrollSelector')).scrollTop(0);
      });
      
    }
  },
  
  deactivate: function() {
    this._super.apply(this, arguments);
    this.set('lastScroll',Ember.$(this.get('scrollSelector')).scrollTop());
    this.set('lastScrollTime',Date.now());
  },
  
});
