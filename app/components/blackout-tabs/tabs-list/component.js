import Ember from 'ember';

export default Ember.Component.extend({
  
  setup: Ember.on('didInsertElement',function(){
    if( this.get('hide') ){
      this.$().hide();
    }
  }),
  
});
