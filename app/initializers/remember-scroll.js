import Ember from 'ember';
import RememberScroll from '../mixins/remember-scroll';

export function initialize(/* container, application */) {
  Ember.Route.reopen(RememberScroll);
}

export default {
  name: 'remember-scroll',
  initialize: initialize
};
