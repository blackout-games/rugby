import Ember from 'ember';
import RememberScroll from '../mixins/remember-scroll';

export function initialize(/*application*/) {
  Ember.Route.reopen(RememberScroll);
}

export default {
  name: 'remember-scroll',
  initialize: initialize
};
