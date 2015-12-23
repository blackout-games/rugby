import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['dash-box','dash-col','no-gap','dash-card'],
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('icon-class')){
      this.$('.dash-card-icon').addClass(this.get('icon-class'));
    }
    
  }),
  
});
