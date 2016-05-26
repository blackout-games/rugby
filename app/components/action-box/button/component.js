import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['action-box-button'],
  
  onInsert: Ember.on('didInsertElement',function(){
    
    this.$().css({
      // Don't add anything here or else it messes with the position of the original button content
      //'padding': this.get('outerPaddingSides')+'px',
    });
    
    Ember.run.scheduleOnce('afterRender', this, ()=>{
      if(this.attrs.getButton){
        this.attrs.getButton(this.$());
      }
    });
    
  }),
  
});
