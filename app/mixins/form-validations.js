import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Mixin.create(EmberValidations,{
  serverErrors: {},
  formErrorMessage: null,
  validationEvent: 'formSubmitted', // Should override where mixin is used
  
  actions: {
    
    submit: function(button){
      
      // NOTE, The first button in the form receives a click event when enter is pressed.
      
      // Button should always be available
      if(!button||button.get('whoAmI')!=='loaderButton'){
        Ember.warn("A button was not provided for form-validation.");
      }
      
      // Make sure animating
      if(!button.get('isAnimating')){
        button.animate();
      }
      
      var self = this;
      this.set('refocusButton',true);
      
      // Save button for later
      this.set('submitButton',button);
      
      // Reset server errors
      this.set('serverErrors',{});
      
      // Client validations
      this.validate().then(function(){
        //Ember.run.later(function(){
        self.requestFromServer();
        //},4000);
      
      
      /**
       * WARNING!!!!!!
       * MUST PROVIDE .catch() here, otherwise when validation fails, validate() causes "undefined" error output in console with no good information on what's causing it - resulting in long debugging sessions.
       */
      
      }).catch(function(){
        
        if(button){
          button.reset();
        }
        
      }).finally(function(){
        
        Ember.run.next(self,function(){
          // Let validated inputs know we've submitted
          self.EventBus.publish(self.get('validationEvent'));
        });
      });
      
      return false;
    },
    
  },
  
  displayServerErrors: function(response){
    
    var errors = response.errors;
    
    if(errors.item){
      this.set('serverErrors.'+errors.item, errors.message);
      Ember.$('#'+errors.item).focus();
      this.set('refocusButton',false);
    } else {
      this.set('formErrorMessage',errors.message);
    }
    
    if(this.get('submitButton')){
      this.get('submitButton').reset(this.get('refocusButton'));
    }
    
  }
  
});
