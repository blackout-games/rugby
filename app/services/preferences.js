import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  
  /**
   * This should be called after session is built
   * If the user is logged in, it will load their preferences
   * If not, defaults are loaded
   */
  loadPreferences() {
    
    // Load preferences into store, return promise if we need to wait
    // Must catch, so that user-blocking works (anything loaded during initialization)
    return this.get('store').findAll('preference').catch((err)=>{
      Ember.Logger.warn('Failed to get preferences');
      print(err);
    });
    
  },
  
  getPref(id, options) {
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
  
  getPrefRecord(id) {
    var pref =  this.get('store').peekRecord('preference',id);
    if(pref){
      return pref;
    } else {
      Ember.Logger.warn('Invalid preference (' + id + ')');
    }
  },
  
  setPref(id, value) {
    if( this.get('session.isAuthenticated')){
      //print(this.get('session').isAuthenticated,this.get('session'));
      var pref = this.getPrefRecord(id);
      if(pref){
        pref.set('value',value);
        return pref.save();
      } else {
        return false;
      }
    } else {
      Ember.Logger.warn(`Could not save preference (${id}) because user is not authenticated`);
      return false;
    }
  },
  
  setPrefs(hash) {
    
    if( this.get('session.isAuthenticated')){
      
      // Ensure all prefs exist
      hash.forEach((val)=>{
        var prefObj = this.getPrefRecord(val.key);
        if(!prefObj){
          return false;
        }
      });
      
      let promises = {};
      
      // Ensure all prefs exist
      hash.forEach((val)=>{
        var prefObj = this.getPrefRecord(val.key);
        prefObj.set('value',val.value);
        promises[val.key] = prefObj.save();
      });
      
      return Ember.RSVP.hash(promises);
      
    } else {
      Ember.Logger.warn(`Could not save preferences because user is not authenticated`);
      return false;
    }
    
  },
  
  pref(id, options) {
    return this.getPref(id,options);
  },
  
});
