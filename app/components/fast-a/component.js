import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  classNames: ['btn-a'],
  
  onInsert: Ember.on('didInsertElement',function(){
    
    this.$().on('mousedown touchstart',(e)=>{
      
      // Left mouse button only
      if(e.type==='mousedown' && e.which!==1){
        return;
      }
      
      this.sendAction();
      
    });
    
    this.$().on('click',(e)=>{
      e.preventDefault();
    });
    
  }),
  
});
