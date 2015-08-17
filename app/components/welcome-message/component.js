import Ember from 'ember';
import Local from '../../models/local';

export default Ember.Component.extend({
  locals: Local.create(),
  
  showMessage: function(){
    
    if(!this.get('locals.welcomeMessageShown')){
      
      var self = this;
      
      Ember.run.next(function(){
        Ember.run.later(function(){
              
          self.modal.show({
            'type': 'notice',
            'title': 'Welcome',
            'message': "Hello! Welcome to the new Blackout Rugby. Please be aware that this is a pre-release version. Most features are not implemented yet. However the features here are intended to be eventually be production ready, so feel free to report bugs on the main website BlackoutRugby.com. Enjoy.",
            'showAction': false,
          });
          
          self.set('locals.welcomeMessageShown',true);
          
        },5000);
      });
      
      
      
    }
    
  }.on('didInsertElement'),
  
});
