import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin,{
  loginErrorMessage: "",
  messages: [],
  validationEvent: 'loginSubmitted',
  stuffToWatch: { submitted: "JEREMY" },
  actions: {
    submit: function(){
      
      // Let validated inputs know we're trying to submit
      this.EventBus.publish(this.get('validationEvent'));
      
      let self = this;
      
      this.validate().then(function() {
        
        // all validations pass
        var data = self.getProperties('identification', 'password');
        data.client_id = 'rugby-ember';
        self.set('messages.logging-in','Logging in...');
        
        return self.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', data).then(function(){},function(){}).finally(function(){
          self.set('messages.logging-in','');
        });
        
      },function(){});
      
      return false;
      
    }
  },
  validations: {
    identification: {
      presence: { message: 'Please provide your username.' },
    },
    password: {
      presence: { message: 'Please provide your password.' },
    },
  },
});