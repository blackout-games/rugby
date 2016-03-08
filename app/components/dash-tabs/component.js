import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['dash-box','dash-box-no-padding'],
  
  setup: Ember.on('didInsertElement',function(){
    
    Ember.$.each(this.get('dashTabs'),(i,$tab)=>{
      $tab.addClass('dash-box-padding');
    });
    
    this.$().css({
      'border-top-left-radius': '15px',
      'border-top-right-radius': '15px',
    });
    
  }),
  
});
