import Ember from 'ember';

export default Ember.Component.extend({
  
  selectTab: Ember.on('didInsertElement',function(){
    this.get('eventBus').publish('selectBlackoutTab-'+this.get('tabGroup'),this.get('tab'));
  }),
  
});
