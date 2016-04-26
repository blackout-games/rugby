import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";
//import c from "../../utils/nested-computed";

export default Ember.Component.extend({
  
  history: Ember.inject.service(),
  userImages: Ember.inject.service(),
  store: Ember.inject.service(),
  
  setPassword: Ember.on('init',function(){
    
    this.get('model').set('password','');
    
  }),
  
  accountForm: Ember.computed('session.data.manager','updateForm',function(){
    
    return [
      {
        id: 'username',
        label: t('login.username'),
        placeholder: t('login.username'),
        valuePath: 'username',
        
        // Keeping for documentation sake. This is how you would add a property from some random object in the same - as opposed to using a model key.
        //value: c('manager.username',{ manager: this.get('session.data.manager') }),
      },
      {
        id: 'password',
        label: t('login.password'),
        type: 'password',
        helper: t('account.password.helper'),
        valuePath: 'password',
      },
      {
        id: 'changePassword',
        label: t('account.password.change-password'),
        type: 'link',
      },
      {
        id: 'newPassword',
        label: t('account.password.new-password'),
        type: 'password',
        valuePath: 'newPassword',
        showOnLink: 'changePassword',
      },
      {
        id: 'email',
        label: t('account.email'),
        type: 'email',
        placeholder: t('account.email'),
        valuePath: 'email',
      },
    ];
    
  }),
  
  actions: {
    onSave(succeed,fail,final){
      
      this.get('model').patch({
        username: true,
        password: true,
        newPassword: true,
        email: true,
      }).then(()=>{
        
        succeed();
        
      }).catch((error)=>{
        fail(error);
      }).finally(final);
      
    },
    onCancel(){
      this.get('history').goBack();
    }
  }
  
});
