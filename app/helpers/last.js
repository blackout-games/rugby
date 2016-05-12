import Ember from 'ember';

/**
 * @param[0]  item or index
 * @param[1]  collection
 * @return {bool}
 */
export function last(params/*, hash*/) {
  
  let item = params[0];
  let collection = params[1];
  
  if(collection){
    
    if(isNaN(item)){
    
      if(collection.get){
        return item === collection.get('lastObject');
      } else {
        return item === collection[collection.length-1];
      }
      
    } else {
      
      if(collection.get){
        return item === collection.get('length')-1;
      } else {
        return item === collection.length-1;
      }
      
    }
    
  }
  return null;
}

export default Ember.Helper.helper(last);
