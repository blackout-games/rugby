import Ember from 'ember';

// Was preventing scrolling back up in sub-nav.
//import PreventBodyScroll from 'rugby-ember/mixins/prevent-body-scroll';

export default Ember.Component.extend({

  classNames: ['normal-scroll','fix-mousewheel-scroll','light-scrollbar'],
  
  classNameBindings: ['hideScrollbar:hide-scrollbar'],
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('horizontal')){
      
      // Prevent body scroll doesn't support horizintal scrolling
      this.set('disablePreventBodyScroll',true);
      
      this.$().addClass('horizontal');
      
      if(this.get('useMousewheelForHorizontal')){
        this.$().on('mouseenter',Ember.run.bind(this,this.setupHorizontalMouseWheel));
      } else {
        this.$().removeClass('fix-mousewheel-scroll');
      }
      
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
  
  /**
   * Must wait until this is visible before calling it so that we can get true width values.
   */
  setupHorizontalMouseWheel(){
    
    if( ! this.get('hasSetupHorizontalMouseWheel') ){
      
      this.set('hasSetupHorizontalMouseWheel',true);
      
      let canScroll = this.$()[0].scrollWidth > this.$().width();
      let abs = Math.abs;
      
      if(canScroll){
        
        this.$().mousewheel((e)=>{
          
          let delta;
          
          if(abs(e.deltaX) > abs(e.deltaY)){
            delta = -e.deltaX;
          } else {
            delta = e.deltaY;
          }
          
          let scrollWas = e.currentTarget.scrollLeft;
          e.currentTarget.scrollLeft -= (delta * 30);
          
          if(scrollWas !== e.currentTarget.scrollLeft
            || this.get('stealAllMousewheelEvents')){
            e.preventDefault();
          }

        });
        
      } else {
        
        this.$().removeClass('fix-mousewheel-scroll');
        
      }
      
    }
    
  },
  
  stopPropagation(e){
    e.stopPropagation();
  },
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('mousewheel mouseenter touchstart touchmove touchend');
    
  }),
  
});
