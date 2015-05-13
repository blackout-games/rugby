import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    showErrors: function() {
      if( ! Ember.isEmpty(this.get('errors') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    },
  },
  
  _initialize: Ember.on('init', function(){
    this.EventBus.subscribe(this.get('validationEvent'), this, function(){ this.send('showErrors'); });
  }),

  _teardown: Ember.on('willDestroyElement', function(){
    this.get('EventBus').unsubscribe('handleSubmit');
  }),
  
});
