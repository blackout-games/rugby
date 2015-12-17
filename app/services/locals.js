import Ember from 'ember';
import Local from '../models/local';

/**
 * 
 * MUST ALWAYS USE THIS SERVICE FOR LOCAL STORAGE!
 * 
 * We need to do this via a service, otherwise we have a different 'locals' object every time it's .create()'d (which can also break IE11)
 */

export default Ember.Service.extend({
  locals: Local.create(),
  
  read(key) {
    
    let locals = this.get('locals');
    return locals.get(key);
    
  },
  
  put(key, val) {
    
    let locals = this.get('locals');
    locals.set(key,val);
    
  }
  
});
