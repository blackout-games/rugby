import Ember from 'ember';

export function nl2br(params/*, hash*/) {
  return Ember.String.htmlSafe(String(params[0]).nl2br());
}

export default Ember.Helper.helper(nl2br);
