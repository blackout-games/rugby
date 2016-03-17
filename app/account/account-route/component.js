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
  
  serverErrors: {},
  
  accountForm: Ember.computed('session.data.manager','serverErrors','updateForm',function(){
    
    return [
      {
        id: 'username',
        label: t('login.username'),
        placeholder: t('login.username'),
        valuePath: 'username',
        serverError: this.get('serverErrors.username.title'),
        
        // Keeping for documentation sake. This is how you would add a property from some random object in the same - as opposed to using a model key.
        //value: c('manager.username',{ manager: this.get('session.data.manager') }),
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
        id: 'changePassword',
        label: t('account.password.change-password'),
        type: 'link',
      },
      {
        id: 'newPassword',
        label: t('account.password.new-password'),
        type: 'password',
        valuePath: 'newPassword',
        serverError: this.get('serverErrors.newPassword.title'),
        showOnLink: 'changePassword',
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
    //this.set('serverError',null);
    this.set('serverErrors',{});
  },
  
  actions: {
    onSave(succeeded,failed,final){
      
      this.get('model').patch({
        username: true,
        password: true,
        newPassword: true,
        email: true,
      }).then(()=>{
        
        succeeded();
        this.resetErrors();
        
      }).catch((error)=>{
        
        this.resetErrors();
        failed();
        
        let errObject = Ember.Object.create(error);
        
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
