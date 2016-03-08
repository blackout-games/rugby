import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['normal-scroll','fix-mousewheel-scroll','light-scrollbar'],
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().on('mousewheel',(e)=>{
      e.stopPropagation();
    });
    
    if(this.get('horizontal')){
      this.$().addClass('horizontal');
      
      this.$().mousewheel(function(event, delta) {

        this.scrollLeft -= (delta * 30);

        event.preventDefault();

      });
      
    }
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('mousewheel');
    
  }),
  
});
