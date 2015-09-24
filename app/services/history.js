import Ember from 'ember';

export default Ember.Service.extend({
  preferences: Ember.inject.service(),
  
  current: null,
  previous: null,
  
  update: function( url ){
    
    // Update last location
    this.set('previous',this.get('current'));
    
    if( url !== this.get('current') ){
      
      // Update preference
      this.get('preferences').setPref('lastRoute',url);
      
      // Set current location
      this.set('current',url);
      
    }
    
    // Communicate
    //print('Current',this.get('current'),'Previous',this.get('previous'));
    
  },
  
});
