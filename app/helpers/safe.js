import Ember from 'ember';

export function safe(params/*, hash*/) {
  return Ember.String.htmlSafe(params[0]);
}

export default Ember.Helper.helper(safe);
