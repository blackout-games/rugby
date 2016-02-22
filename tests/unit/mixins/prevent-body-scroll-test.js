import Ember from 'ember';
import PreventBodyScrollMixin from '../../../mixins/prevent-body-scroll';
import { module, test } from 'qunit';

module('Unit | Mixin | prevent body scroll');

// Replace this with your real tests.
test('it works', function(assert) {
  let PreventBodyScrollObject = Ember.Object.extend(PreventBodyScrollMixin);
  let subject = PreventBodyScrollObject.create();
  assert.ok(subject);
});
