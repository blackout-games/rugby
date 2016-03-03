import Ember from 'ember';

export function lowerCase(params/*, hash*/) {
  return params[0].toLowerCase();
}

export default Ember.Helper.helper(lowerCase);
