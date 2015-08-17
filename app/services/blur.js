import Ember from 'ember';

export default Ember.Service.extend({
  
  lastWindowBlurTime: 0,
  lastWindowFocusTime: 0,
  
  lastBlurTime: function(){
    return this.get('lastWindowBlurTime');
  },
  
  lastFocusTime: function(){
    return this.get('lastWindowFocusTime');
  },
  
  watchWindowBlur: function(){
    
    var self = this;
    
    Ember.$([window,document]).blur(function(){
      self.set('lastWindowBlurTime',Date.now());
    }).focus(function(){
      self.set('lastWindowFocusTime',Date.now());
    });
    
  }.on('init'),
  
});
