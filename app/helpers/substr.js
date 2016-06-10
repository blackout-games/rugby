import Ember from 'ember';

export function substr(params/*, hash*/) {
  
  let str = params[0];
  let start = params[1] || 0;
  let length = params[2] || null;
  
  str = String(str);
  
  return str.substr(start,length);
}

export default Ember.Helper.helper(substr);
