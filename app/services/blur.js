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
    
    Ember.$([window,document]).blur(()=>{
      this.set('lastWindowBlurTime',Date.now());
    }).focus(()=>{
      this.set('lastWindowFocusTime',Date.now());
    });
    
  }),
  
});
