import Ember from 'ember';
import Local from '../models/local';

/**
 * We need to do this via a service, otherwise we have a different 'locals' object every time it's .create()'d
 */

export default Ember.Service.extend({
  locals: Local.create(),
  
  read: function( key ){
    
    let locals = this.get('locals');
    return locals.get(key);
    
  },
  
  put: function(key,val){
    
    let locals = this.get('locals');
    locals.set(key,val);
    
  }
  
});
