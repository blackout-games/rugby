import Ember from 'ember';
import t from "../../utils/translation-macro";
//import c from "../../utils/nested-computed";

export default Ember.Component.extend({
  
  history: Ember.inject.service(),
  userImages: Ember.inject.service(),
  store: Ember.inject.service(),
  
  setPassword: Ember.on('init',function(){
    
    this.get('model').set('password','');
    
  }),

  initUserImages: Ember.on('didInsertElement', function() {
    this.get('userImages').registerManagerImage('.manager-avatar-account',Ember.Blackout.getCSSColor('bg-light'),true);
  }),
  
  serverErrors: {},
  
  accountForm: Ember.computed('session.manager','serverErrors','updateForm',function(){
    
    return [
      {
        id: 'username',
        label: t('login.username'),
        placeholder: t('login.username'),
        valuePath: 'username',
        serverError: this.get('serverErrors.username.title'),
        
        // Keeping for documentation sake. This is how you would add a property from some random object in the same - as opposed to using a model key.
        //value: c('manager.username',{ manager: this.get('session.manager') }),
      },
      {
        id: 'password',
        label: t('login.password'),
        type: 'password',
        helper: t('account.password.helper'),
        valuePath: 'password',
        serverError: this.get('serverErrors.password.title'),
      },
      {
        id: 'email',
        label: t('account.email'),
        type: 'email',
        placeholder: t('account.email'),
        valuePath: 'email',
        serverError: this.get('serverErrors.email.title'),
      },
    ];
    
  }),
  
  resetErrors(){
    this.set('serverError',null);
    this.set('serverErrors',{});
  },
  
  actions: {
    onSave(succeeded,failed,final){
      
      this.get('model').save().then(()=>{
        
        succeeded();
        this.resetErrors();
        
      }).catch((error)=>{
        
        this.resetErrors();
        failed();
        
        let errObject = Ember.Object.extend(error).create();
        
        let item = errObject.get('errors.item');
        if(item){
          this.set('serverErrors.'+item,errObject.get('errors'));
          this.set('updateForm',true);
        } else {
          this.set('serverError',errObject.get('errors.title'));
        }
        
      }).finally(final);
      
    },
    onCancel(){
      this.get('history').goBack();
    }
  }
  
});
