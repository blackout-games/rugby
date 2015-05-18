import Ember from 'ember';
import TimersMixin from '../../../mixins/timers';
import { module, test } from 'qunit';

module('TimersMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var TimersObject = Ember.Object.extend(TimersMixin);
  var subject = TimersObject.create();
  assert.ok(subject);
});
