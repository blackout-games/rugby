import Ember from 'ember';

/**
 * Use this to store anything within the app's scope in a single window/tab
 * We can also use it to react to changes across the app. See squad sorting.
 */

export default Ember.Service.extend({
  
  keyExists(key){
    
    return this.get(key) !== undefined;
    
  }
  
});
