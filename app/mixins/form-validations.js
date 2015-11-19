import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Mixin.create(EmberValidations,{
  serverErrors: {},
  formErrorMessage: null,
  validationEvent: 'formSubmitted', // Should override where mixin is used
  i18n: Ember.inject.service(),
  
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
      
      // Client validations
      this.validate().then(function(){
        //Ember.run.later(function(){
        self.requestFromServer();
        //},4000);
      
      
      /**
       * WARNING!!!!!!
       * MUST PROVIDE .catch(()=>{}) here, otherwise when validation fails, validate() causes "undefined" error output in console with no good information on what's causing it - resulting in long debugging sessions.
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
  
  initValidationMessages: Ember.on('init',function() {
    
    this.updateValidationMessages();
    this.get('EventBus').subscribe('localeChanged', this, this.updateValidationMessages);
    
  }),
  
  cleanUpListeners: Ember.on('deactivate','willDestroyElement',function(){
    
    this.get('EventBus').unsubscribe('localeChanged', this, this.updateValidationMessages);
    
  }),
  
  updateValidationMessages: Ember.on('init',function() {
    
    let validations = this.get('validations');
    let self = this;
    
    if(validations){
      
      Ember.$.each(validations,(itemName,itemRules) => {
        
        Ember.$.each(itemRules,(ruleName,rule) => {
          
          if(rule.tMessage){
            let translation = self.get('i18n').t(rule.tMessage);
            
            self.set('validations.' + itemName + '.' + ruleName + '.message',translation);
            
            // Re-render any showing messages
            self.validate().catch(()=>{}); // Must provide catch
            
          }
          
        });
        
      });
      
    }
    
  }),
  
});
