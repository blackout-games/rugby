import Ember from 'ember';

/**
 * When sending actions to components, as a one off, see:
 * http://www.samselikoff.com/blog/getting-ember-components-to-respond-to-actions/
 * We use the event bus here as there can be many validated inputs per form.
 */

export default Ember.Component.extend({
  
  validationEvent: '', // Pass this in on creation to identify the form being submitted
  errorType: null,
  inputId: null,
  
  uiEvents: {
    'selector': ':first-child',
    'focus': 'updateOnFocus',
    'blur': 'updateOnBlur',
  },
  
  
  classes: function(){
    return this.get('inputClass') + ' form-control';
  }.property(),
  
  setupValidation: function(){
    
    this.get('EventBus').subscribe(this.get('validationEvent'), this, this.showErrors);
    
    Ember.$('input[name="password"]').attr('autocomplete', 'off');
    
  }.on('didInsertElement'),
  
  showErrors: function(){
    this.send('showErrors'); 
  },

  cleanup: function(){
    
    this.get('EventBus').unsubscribe(this.get('validationEvent'), this, this.showErrors);
    
  }.on('willDestroyElement'),
  
  updateClientError: function(){
    if( !Ember.isEmpty(this.get('clientError')) ){
      this.set('error',this.get('clientError'));
      this.set('errorType','client');
    } else if(this.get('errorType') === "client"){
      this.set('error',null);
    }
  }.observes('clientError'),
  
  updateServerError: function(){
    if( !Ember.isEmpty(this.get('serverError')) ){
      this.set('error',this.get('serverError'));
      this.set('errorType','server');
      this.send('showErrors');
    } else if(this.get('errorType') === "server"){
      this.set('error',null);
    }
  }.observes('serverError'),
  
  updateOnFocus: function(){
    if(this.get('errorType') === "client"){
      this.set("showError", false);
    }
  },
  
  updateOnBlur: function(){
    if(this.get('errorType') === "client"){
      this.send('showErrors');
    }
  },
  
  actions: {
    showErrors: function() {
      if( ! Ember.isEmpty(this.get('error') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    },
    hideErrors: function() {
      this.set("showError", false);
    },
  },
  
});
