import Ember from 'ember';

/**
 * This allows us to create computed properties on static data structures, for example, in forms sent to blackout-form. See account/account-route for an example.
 * 
 * It creates a computed property which will always return the key from the given dependent object, but adds the dependent object to the parent object so that Ember can react to changes on the dependent, even when this computed propery is added as a nested property.
 * 
 * @param  {String} key       The key on the dependent to return, and watch
 * @param  {Object} dependent A hash containing a property containing the dependent object, i.e. { manager: manager }
 * @return {Ember.computed}
 */

export default function nestedComputed( key, dependent={} ) {
  
  return Ember.computed('_dependents.'+key,{
    get(){
      
      // Ensure _dependents property exists on parent object
      if(!this._dependents){
        this._dependents = Ember.Object.create();
      }
      
      // Ensure dependent has been added
      this._dependents.setProperties(dependent);
      
      log('_dependents ',this._dependents);
      return this._dependents.get(key);
    }
  });
  
}