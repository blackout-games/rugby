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
    //this.get('eventBus').publish('disableGameNav');
    this.get('eventBus').publish('hideBottomTabBar');
  }),
  
  leave: Ember.on('willDestroyElement', function(){
    //this.get('eventBus').publish('enableGameNav');
    this.get('eventBus').publish('showBottomTabBar');
  }),
  
  requestFromServer() {
    
    var data = this.get('model').getProperties('username','password');
    
    // simple-auth-authenticator:oauth2-password-grant 
    // authenticator:password
    return this.get('session').authenticate('authenticator:password', data.username, data.password
    ).then(()=>{
      
      // Successful login is handled at upper levels
      
    },(response)=>{
      
      this.displayServerErrors(response);
      
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
