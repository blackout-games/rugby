import Ember from 'ember';
import FullHeight from '../../mixins/full-height';
import FormValidations from '../../mixins/form-validations';
import t from "../../utils/translation-macro";
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  username: validator('presence', {
    presence: true,
    description: t('login.username'),
  }),
  password: validator('presence', {
    presence: true,
    description: t('login.password'),
  }),
});

export default Ember.Component.extend(FullHeight,FormValidations,{
  Modal: Ember.inject.service('modal'),
  classNames: ['login-background', 'tint-dark', 'clearfix', 'vf-parent'],
  
  onInit: Ember.on('init',function(){
    
    let model = Ember.Object.extend(
      Validations,
      Ember.getOwner(this).ownerInjection(),
      {
        username: null,
        password: null,
      }
    ).create();
    
    this.set('model',model);
    
  }),
  
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
    
    var data = self.get('model').getProperties('username','password');
    
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
  
});
