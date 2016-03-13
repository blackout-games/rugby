import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['normal-scroll','fix-mousewheel-scroll','light-scrollbar'],
  
  setup: Ember.on('didInsertElement',function(){
    
    
    if(this.get('horizontal')){
      
      this.$().addClass('horizontal');
      
      Ember.run.next(()=>{
        
        let canScroll = this.$()[0].scrollWidth > this.$().width();
        let abs = Math.abs;
        
        if(canScroll){
          
          this.$().mousewheel(function(event) {
            
            let delta;
            
            if(abs(event.deltaX) > abs(event.deltaY)){
              delta = -event.deltaX;
            } else {
              delta = event.deltaY;
            }
            
            this.scrollLeft -= (delta * 30);

            event.preventDefault();

          });
          
        } else {
          
          this.$().removeClass('fix-mousewheel-scroll');
          
        }
        
      });
      
      
    } else {
      
      Ember.run.next(()=>{
        
        let canScroll = this.$()[0].scrollHeight > this.$().height();
        
        if(canScroll){
          
          this.$().on('mousewheel',(e)=>{
            e.stopPropagation();
          });
          
        } else {
          
          this.$().removeClass('fix-mousewheel-scroll');
          
        }
        
      });
    
    }
    
    // Fix touch sometimes not working
    this.$().off('touchstart touchmove touchend').on('touchstart touchmove touchend',(e)=>{
      e.stopPropagation();
    });
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('mousewheel touchstart touchmove touchend');
    
  }),
  
});
