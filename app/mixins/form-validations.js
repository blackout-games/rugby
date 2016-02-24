import Ember from 'ember';

export default Ember.Mixin.create({
  serverErrors: {},
  formErrorMessage: null,
  
  actions: {
    
    submit(button) {
      
      // NOTE, The first button in the form receives a click event when enter is pressed.
      
      // Button should always be available
      if(!button||button.get('whoAmI')!=='loaderButton'){
        Ember.Logger.warn("A button was not provided for form-validation.");
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
      
      // Tell component that we have now validated at least once
      this.set('hasValidated',true);
      
      // Client validations
      const { validations } = this.get('model').validateSync();
      
      if(validations.get('isValid')){
        //Ember.run.later(function(){
        self.requestFromServer();
        //},4000);
      
      
      /**
       * WARNING!!!!!!
       * MUST PROVIDE .catch(()=>{}) here, otherwise when validation fails, validate() causes "undefined" error output in console with no good information on what's causing it - resulting in long debugging sessions.
       */
      
      } else {
        
        if(button){
          button.reset();
        }
        
      }
        
      Ember.run.next(self,function(){
        // Let validated inputs know we've submitted
        self.EventBus.publish(self.get('validationEvent'));
      });
      
      return false;
    },
    
  },
  
  displayServerErrors(response) {
    
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
    
  },
  
});
