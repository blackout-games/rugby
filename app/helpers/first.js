import Ember from 'ember';

/**
 * @param[0]  item or index
 * @param[1]  collection
 * @return {bool}
 */
export function first(params/*, hash*/) {
  
  let item = params[0];
  let collection = params[1];
  
  if(collection){
    
    if(isNaN(item)){
    
      if(collection.get){
        return item === collection.get('firstObject');
      } else {
        return item === collection[0];
      }
      
    } else {
      
      return item === 0;
      
    }
    
  }
  return null;
}

export default Ember.Helper.helper(first);
