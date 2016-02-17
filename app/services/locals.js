import Ember from 'ember';

/**
 * 
 * MUST ALWAYS USE THIS SERVICE FOR LOCAL STORAGE!
 * 
 * We need to do this via a service, otherwise we have a different 'locals' object every time it's .create()'d (which can also break IE11)
 */

export default Ember.Service.extend({
  namespace: 'rugby_ember:',
  
  write(key, val) {
    localStorage.setItem(this.get('namespace')+key,this.stringify(val));
  },
  
  read(key) {
    return this.parse(localStorage.getItem(this.get('namespace')+key));
  },
  
  stringify(val) {
    return JSON.stringify(val);
  },
  
  parse(val) {
    if(!val){
      return undefined;
    } else {
      return JSON.parse(val);
    }
  },
  
  checkLocalStorage: Ember.on('init',function(){
    
    // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
    // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
    // to avoid the entire page breaking, without having to do a check at each usage of Storage.
    if (typeof localStorage === 'object') {
      try {
        localStorage.setItem('localStorage', 1);
        localStorage.removeItem('localStorage');
      } catch (e) {
        Storage.prototype._setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function() {};
        //alert('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
      }
    }
    
  }),
  
});
