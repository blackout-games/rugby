import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Service.extend({
  preferences: Ember.inject.service(),
  session: Ember.inject.service(),
  
  maxHistoryLength:50,
  
  current: null,
  previous: null,
  history: [],
  skipNextRouteFlag: false,
  defaultRoute: "dashboard",
  
  goBack(defaultRoute){
    
    var lastRoute = this.pullFromHistory();
    
    if(typeof(lastRoute) === 'undefined'){
      lastRoute = defaultRoute ? defaultRoute : this.get('defaultRoute');
    }
    
    var app = getOwner(this).lookup('route:application');
    
    // Don't store this route in history
    this.skipNextRoute();
    
    app.transitionTo(lastRoute);
    
  },
  
  update(url) {
    
    Ember.run.debounce(this,this._update,url,111);
    
  },
  
  _update(url){
    if( url !== this.get('current') ){
      
      // Add to history store
      this.addToHistory(this.get('current'));
      
      // Update preference
      if(this.get('session.isAuthenticated')){
        this.get('preferences').setPref('lastRoute',url);
      }
      
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
      
    } else {
      this.set('skipNextRouteFlag',false);
    }
    
  },
  
  pullFromHistory() {
    return this.get('history').pop();
  },
  
  skipNextRoute() {
    this.set('skipNextRouteFlag',true);
  },
  
});
