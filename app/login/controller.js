import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin,{
  loginErrorMessage: "",
  //errors: [],
  actions: {
    submit: function(){
      let self = this;
      this.validate().then(function() {
        // all validations pass
        self.get('isValid'); // true
      }).catch(function() {
        // any validations fail
        self.get('isValid'); // false
      }).finally(function() {
        // all validations complete
        // regardless of isValid state
        self.get('isValid'); // true || false 
      });
      var data = this.getProperties('identification', 'password');
      data.client_id = 'rugby-ember';
      return this.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', data);
      
    }
  },
  validations: {
    identification: {
      presence: true,
    },
    password: {
      presence: true,
    },
  },
});