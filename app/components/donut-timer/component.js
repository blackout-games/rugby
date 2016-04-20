import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['donut-timer'],
  
  onAttrChange: Ember.on('didUpdateAttrs',function(opts){
    
    if(this.attrChanged(opts,'isTiming')){
      
      if(this.get('isTiming')){
        this.startTimer();
      } else {
        this.cancelTimer();
      }
      
    }
    
  }),
  
  startTimer(){
    
    if(this.get('duration')){
      this.$('.donut-timer-filler').css({
        'animation-duration': this.get('duration')+'s',
      });
      this.$('.donut-timer-spinner').css({
        'animation-duration': this.get('duration')+'s',
      });
      this.$('.donut-timer-mask').css({
        'animation-duration': this.get('duration')+'s',
      });
    }
    
    // Start the timer
    this.$().addClass('donut-timer-go-reverse');
    
    // Start the timer
    this.$('.donut-timer-spinner').off(Ember.Blackout.afterCSSAnimation).on(Ember.Blackout.afterCSSAnimation,()=>{
      if(this.attrs.onComplete){
        this.attrs.onComplete();
        this.$().removeClass('donut-timer-go-reverse');
      }
    });
    
  },
  
  cancelTimer(){
    
    this.$().removeClass('donut-timer-go-reverse');
    
  },
  
});
