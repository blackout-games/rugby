import Ember from 'ember';
import UiEventsMixin from '../../../mixins/ui-events';
import { module, test } from 'qunit';

module('Unit | Mixin | ui events');

// Replace this with your real tests.
test('it works', function(assert) {
  var UiEventsObject = Ember.Object.extend(UiEventsMixin);
  var subject = UiEventsObject.create();
  assert.ok(subject);
});
