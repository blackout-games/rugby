import Ember from 'ember';
import FullHeight from '../../mixins/full-height';
import FormValidations from '../../mixins/form-validations';

export default Ember.Component.extend(FullHeight,FormValidations,{
  Modal: Ember.inject.service('modal'),
  validationEvent: 'loginSubmitted',
  
  arrive: function(){
    this.get('EventBus').publish('disableGameNav');
  }.on('didInsertElement'),
  
  leave: function(){
    this.get('EventBus').publish('enableGameNav');
  }.on('willDestroyElement'),
  
  requestFromServer: function() {
    
    var self = this;
    
    var data = self.getProperties('username','password');
    data.identification = data.username;
    data.client_id = 'rugby-ember';
    
    // simple-auth-authenticator:oauth2-password-grant 
    // authenticator:password
    return self.get('session').authenticate('authenticator:password', data
    ).then(function(){
      
      // Successful login is handled at upper levels
      
    },function(response){
      
      self.displayServerErrors(response);
      
    });
    
  },
  
  'fbLoginAction': 'loginWithFacebook',
  
  actions: {
    goHome: function(){
      this.sendAction('goHome');
    },
    loginWithFacebook: function(button){
      this.sendAction('fbLoginAction',button);
    },
  },
  
  validations: {
    'username': {
      presence: { message: 'Please provide your username.' },
    },
    'password': {
      presence: { message: 'Please provide your password.' },
    },
  },
  
});
