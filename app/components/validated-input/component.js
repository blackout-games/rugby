import Ember from 'ember';

/**
 * When sending actions to components, as a one off, see:
 * http://www.samselikoff.com/blog/getting-ember-components-to-respond-to-actions/
 * We use the event bus here as there can be many validated inputs per form.
 */

export default Ember.Component.extend({
  
  validationEvent: '', // Pass this in on creation to identify the form being submitted
  
  setupValidation: function(){
    this.get('EventBus').subscribe(this.get('validationEvent'), this, function(){ this.send('showErrors'); });
  }.on('init'),
  
  actions: {
    showErrors: function() {
      if( ! Ember.isEmpty(this.get('errors') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    },
  },

  _teardown: function(){
    this.get('EventBus').unsubscribe('handleSubmit');
  }.on('willDestroyElement'),
  
});
