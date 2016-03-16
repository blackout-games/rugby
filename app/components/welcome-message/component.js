import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  locals: Ember.inject.service(),
  
  showMessage: Ember.on('didInsertElement', function(){
    
    if(!this.get('locals').read('welcomeMessageShown')){
      
      Ember.run.next(()=>{
        Ember.run.later(()=>{
              
          this.modal.show({
            type: 'notice',
            title: t('modals.welcome.title'),
            message: t('modals.welcome.message'),
            showDefaultAction: false,
          });
          
          this.get('locals').write('welcomeMessageShown',true);
          
        },5000);
      });
      
    }
    
  }),
  
});
