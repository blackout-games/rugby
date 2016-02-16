import Ember from 'ember';

export default Ember.Service.extend({
  preferences: Ember.inject.service(),
  
  maxHistoryLength:50,
  
  current: null,
  previous: null,
  history: [],
  skipNextRouteFlag: false,
  
  update(url) {
    
    if( url !== this.get('current') ){
      
      // Add to history store
      this.addToHistory(this.get('current'));
      
      // Update preference
      this.get('preferences').setPref('lastRoute',url);
      
      // Set current location
      this.set('current',url);
      
    }
    
    // Communicate
    //print('Current',this.get('current'),'Previous',this.get('previous'));
    
  },
  
  addToHistory(url) {
    
    if(url===null){
      return;
    }
    
    // Update last location
    this.set('previous',url);
    
    if(!this.get('skipNextRouteFlag')){
      
      this.get('history').push(url);
      if(this.get('history').length>this.get('maxHistoryLength')){
        this.get('history').splice(0,1);
      }
      
    }
    
  },
  
  pullFromHistory() {
    return this.get('history').pop();
  },
  
  skipNextRoute() {
    this.set('skipNextRouteFlag',true);
  },
  
});
