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
        console.log("IS VALID");
        console.log(self.get('isValid')); // true
      }).catch(function() {
        // any validations fail
        console.log("IS NOT VALID");
        console.log(self.get('isValid')); // false
      }).finally(function() {
        // all validations complete
        // regardless of isValid state
        console.log("EVERYTHING IS VALIDATED");
        console.log(self.get('isValid')); // true || false 
      });
      var data = this.getProperties('identification', 'password');
      if( !data.identification ){
        alert('enter id');
      } else if( !data.password ){
        alert('enter pass');
      } else {
        data.client_id = 'rugby-ember';
        return this.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', data);
      }
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