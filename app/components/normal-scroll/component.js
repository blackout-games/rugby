import Ember from 'ember';
import PreventBodyScroll from '../../mixins/prevent-body-scroll';

export default Ember.Component.extend(PreventBodyScroll,{

  classNames: ['normal-scroll','fix-mousewheel-scroll','light-scrollbar'],
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('horizontal')){
      
      // Prevent body scroll doesn't support horizintal scrolling
      this.set('disablePreventBodyScroll',true);
      
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
    this.$().off('touchmove',this.stopPropagation).on('touchmove',this.stopPropagation);
    
  }),
  
  stopPropagation(e){
    e.stopPropagation();
  },
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('mousewheel touchstart touchmove touchend');
    
  }),
  
});
