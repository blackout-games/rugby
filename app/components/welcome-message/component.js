import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  locals: Ember.inject.service(),
  
  showMessage: Ember.on('didInsertElement', function(){
    
    if(!this.get('locals').read('welcomeMessageShown')){
      
      var self = this;
      
      Ember.run.next(function(){
        Ember.run.later(function(){
              
          self.modal.show({
            type: 'notice',
            title: t('modals.welcome.title'),
            message: t('modals.welcome.message'),
            showDefaultAction: false,
          });
          
          self.get('locals').write('welcomeMessageShown',true);
          
        },5000);
      });
      
    }
    
  }),
  
});
