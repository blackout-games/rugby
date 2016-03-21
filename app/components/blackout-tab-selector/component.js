import Ember from 'ember';

export default Ember.Component.extend({
  
  selectTab: Ember.on('didInsertElement',function(){
    Ember.run.schedule('afterRender',this,()=>{
      this.get('eventBus').publish('selectBlackoutTab-'+this.get('tabGroup'),this.get('tab'));
    });
  }),
  
});
