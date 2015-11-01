import Ember from 'ember';

export default Ember.Component.extend({
  locals: Ember.inject.service(),
  
  showMessage: Ember.on('didInsertElement', function(){
    
    if(!this.get('locals').read('welcomeMessageShown')){
      
      var self = this;
      
      Ember.run.next(function(){
        Ember.run.later(function(){
              
          self.modal.show({
            'type': 'notice',
            'title': 'Welcome',
            'message': "Hello! Welcome to the new Blackout Rugby. Please be aware that this is a pre-release version. Most features are not implemented yet. However the features here are intended to eventually be production ready, so feel free to report bugs on the main website BlackoutRugby.com. Enjoy.",
            'showAction': false,
          });
          
          self.get('locals').put('welcomeMessageShown',true);
          
        },5000);
      });
      
      
      
    }
    
  }),
  
});
