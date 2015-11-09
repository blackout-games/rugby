import Ember from 'ember';
import FullHeight from '../../mixins/full-height';
import FormValidations from '../../mixins/form-validations';

export default Ember.Component.extend(FullHeight,FormValidations,{
  Modal: Ember.inject.service('modal'),
  validationEvent: 'loginSubmitted',
  classNames: ['login-background', 'tint-dark', 'clearfix', 'vf-parent'],
  
  arrive: Ember.on('didInsertElement', function(){
    //this.get('EventBus').publish('disableGameNav');
    this.get('EventBus').publish('hideBottomTabBar');
  }),
  
  leave: Ember.on('willDestroyElement', function(){
    //this.get('EventBus').publish('enableGameNav');
    this.get('EventBus').publish('showBottomTabBar');
  }),
  
  requestFromServer() {
    
    var self = this;
    
    var data = self.getProperties('username','password');
    
    // simple-auth-authenticator:oauth2-password-grant 
    // authenticator:password
    return self.get('session').authenticate('authenticator:password', data.username, data.password
    ).then(function(){
      
      // Successful login is handled at upper levels
      
    },function(response){
      
      self.displayServerErrors(response);
      
    });
    
  },
  
  'fbLoginAction': 'loginWithFacebook',
  
  actions: {
    goHome() {
      this.sendAction('goHome');
    },
    loginWithFacebook(button) {
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
