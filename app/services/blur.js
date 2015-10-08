import Ember from 'ember';

export default Ember.Service.extend({
  
  lastWindowBlurTime: 0,
  lastWindowFocusTime: 0,
  
  lastBlurTime() {
    return this.get('lastWindowBlurTime');
  },
  
  lastFocusTime() {
    return this.get('lastWindowFocusTime');
  },
  
  watchWindowBlur: Ember.on('init', function(){
    
    var self = this;
    
    Ember.$([window,document]).blur(function(){
      self.set('lastWindowBlurTime',Date.now());
    }).focus(function(){
      self.set('lastWindowFocusTime',Date.now());
    });
    
  }),
  
});
