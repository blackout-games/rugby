import Ember from 'ember';

export default Ember.Component.extend({
  
  selectTab: Ember.on('didInsertElement',function(){
    Ember.run.schedule('afterRender',this,()=>{
      
      this.get('eventBus').publish('selectBlackoutTab-'+this.get('tabGroup'),this.get('tab'));
      
      // Run again to get sub-tabs which only just started listening for events after the last event was broadcast and parent tab was rendered
      Ember.run.next(()=>{
        this.get('eventBus').publish('selectBlackoutTab-'+this.get('tabGroup'),this.get('tab'));
      });
      
    },2000);
  }),
  
});
