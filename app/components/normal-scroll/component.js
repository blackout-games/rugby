import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['normal-scroll','fix-mousewheel-scroll','light-scrollbar'],
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().on('mousewheel',(e)=>{
      e.stopPropagation();
    });
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('mousewheel');
    
  }),
  
});
