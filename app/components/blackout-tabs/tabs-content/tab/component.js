import Ember from 'ember';

export default Ember.Component.extend({
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('noPadding')){
      this.$().data('tab-no-padding',true);
    }
    
  }),
  
});
