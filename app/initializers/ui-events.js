import uiEvents from '../mixins/ui-events';
import Ember from 'ember';

export function initialize(/*container, application*/) {
  Ember.Component = Ember.Component.extend(uiEvents);
}

export default {
  name: 'ui-events',
  initialize: initialize
};
