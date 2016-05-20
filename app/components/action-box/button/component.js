import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['action-box-button'],
  
  onInsert: Ember.on('didInsertElement',function(){
    
    this.$().css({
      'padding-right': this.get('outerPaddingSides')+'px',
    });
    
    Ember.run.scheduleOnce('afterRender', this, ()=>{
      if(this.attrs.getButton){
        this.attrs.getButton(this.$());
      }
    });
    
  }),
  
});
