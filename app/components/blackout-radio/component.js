import Ember from 'ember';

const {
  computed,
  defineProperty,
} = Ember;

export default Ember.Component.extend({
  classNames: ['gap-xs','blackout-radio'],
  
  onInit: Ember.on('init',function(){
    
    if(this.get('valuePath')){
      
      var valuePath = this.get('valuePath');
      defineProperty(this, 'groupValue', computed.alias(`model.${valuePath}`));
      
    }
    
  }),
  
});
