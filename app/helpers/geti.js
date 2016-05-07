import Ember from 'ember';

/**
 * Get helper, but by index instead of key
 */
export function geti(params/*, hash*/) {
  if(params[0] && typeof params[0] === 'object'){
    if(params[0].objectAt){
      return params[0].objectAt(params[1]);
    } else {
      return params[0][params[1]];
    }
  } else {
    return null;
  }
}

export default Ember.Helper.helper(geti);
