import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  
  /**
   * This should be called after session is built
   * If the user is logged in, it will load their preferences
   * If not, defaults are loaded
   */
  loadPreferences: function(){
    
    // We need to make the session available
    var session = this.container.lookup('service:session');
    this.set('session',session);
    
    // Load preferences into store, return promise if we need to wait
    // Must catch, so that user-blocking works (anything loaded during initialization)
    return this.get('store').findAll('preference').catch(function(){});
    
  },
  
  getPref: function( id,options ){
    var pref = this.getPrefRecord(id);
    if(pref){
      var val = pref.get('value');
      if(options && options.type === 'date'){
        if(val){
          val = new Date(val);
        }
      }
      return val;
    } else {
      Ember.Logger.warn('Invalid preference (' + id + ')');
    }
  },
  
  getPrefRecord: function( id ){
    var pref =  this.get('store').peekRecord('preference',id);
    if(pref){
      return pref;
    } else {
      Ember.Logger.warn('Invalid preference (' + id + ')');
    }
  },
  
  setPref: function( id, value ){
    if( this.get('session.isAuthenticated')){
      //print(this.get('session').isAuthenticated,this.get('session'));
      var pref = this.getPrefRecord(id);
      if(pref){
        pref.set('value',value);
        pref.save();
      }
    }
  },
  
  pref: function( id, options ){
    return this.getPref(id,options);
  },
  
});
