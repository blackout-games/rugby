import Ember from 'ember';

export default Ember.Component.extend({
  
  setup: Ember.on('didInsertElement',function(){
    
    Ember.run.scheduleOnce('afterRender', this, function(){
      this.get('eventBus').publish('createSubNav',this.$(),this.attrs);
    });
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.get('eventBus').publish('destroySubNav',this.$());
    
  }),
  
});
