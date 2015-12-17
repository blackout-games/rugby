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
  
  classes: Ember.computed(function(){
    return this.get('inputClass') + ' form-control';
  }),
  
  setupValidation: Ember.on('didInsertElement', function(){
    
    this.get('EventBus').subscribe(this.get('validationEvent'), this, this.showErrors);
    
    Ember.$('input[name="password"]').attr('autocomplete', 'off');
    
  }),
  
  showErrors() {
    this.send('showErrors'); 
  },

  cleanup: Ember.on('willDestroyElement', function(){
    
    this.get('EventBus').unsubscribe(this.get('validationEvent'), this, this.showErrors);
    
  }),
  
  didUpdateAttrs( options ) {
    var o = options.oldAttrs;
    var n = options.newAttrs;

    if( n.clientError.value !== o.clientError.value ){
      this.updateClientError();
    }

    if( n.serverError.value !== o.serverError.value ){
      this.updateServerError();
    }
  },
  
  updateClientError() {
    if( !Ember.isEmpty(this.get('clientError')) ){
      this.set('error',this.get('clientError'));
      this.set('errorType','client');
    } else if(this.get('errorType') === "client"){
      this.set('error',null);
    }
  },
  
  updateServerError() {
    if( !Ember.isEmpty(this.get('serverError')) ){
      this.set('error',this.get('serverError'));
      this.set('errorType','server');
      this.send('showErrors');
    } else if(this.get('errorType') === "server"){
      this.set('error',null);
    }
  },
  
  updateOnFocus() {
    if(this.get('errorType') === "client"){
      this.set("showError", false);
    }
  },
  
  updateOnBlur() {
    if(this.get('errorType') === "client"){
      this.send('showErrors');
    }
  },
  
  actions: {
    showErrors() {
      if( ! Ember.isEmpty(this.get('error') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    },
    hideErrors() {
      this.set("showError", false);
    },
  },
  
});
