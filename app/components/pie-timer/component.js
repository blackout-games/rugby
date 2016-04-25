import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['pie-timer'],
  
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
      this.$('.pie-timer-filler').css({
        'animation-duration': this.get('duration')+'s',
      });
      this.$('.pie-timer-spinner').css({
        'animation-duration': this.get('duration')+'s',
      });
      this.$('.pie-timer-mask').css({
        'animation-duration': this.get('duration')+'s',
      });
    }
    
    // Start the timer
    this.$().addClass('pie-timer-go-reverse');
    
    // Start the timer
    this.$('.pie-timer-spinner').off(Ember.Blackout.afterCSSAnimation).on(Ember.Blackout.afterCSSAnimation,()=>{
      if(this.attrs.onComplete){
        this.attrs.onComplete();
        this.$().removeClass('pie-timer-go-reverse');
      }
    });
    
  },
  
  cancelTimer(){
    
    this.$().removeClass('pie-timer-go-reverse');
    
  },
  
});
