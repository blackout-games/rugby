import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Mixin.create(EmberValidations,{
  serverErrors: {},
  formErrorMessage: null,
  validationEvent: 'loginSubmitted',
  
  actions: {
    submit: function(button){
      var self = this;
      this.set('refocusButton',true);
      
      // Save button for later
      this.set('submitButton',button);
      
      // Let validated inputs know we're trying to submit
      this.EventBus.publish(self.get('validationEvent'));
      
      // Reset server errors
      this.set('serverErrors',{});
      
      // Client validations
      this.validate().then(function(){
        //Ember.run.later(function(){
          self.requestFromServer();
        //},4000);
      },function(){
        button.reset();
      });
      
      return false;
      
    },
  },
  
  displayServerErrors: function(response){
    
    var errors = response.errors;
    print("ERRORS",response);
    if(errors.item){
      this.set('serverErrors.'+errors.item, errors.message);
      Ember.$('#'+errors.item).focus();
      this.set('refocusButton',false);
    } else {
      this.set('formErrorMessage',errors.message);
    }
    
    this.get('submitButton').reset(this.get('refocusButton'));
    
  }
  
});
