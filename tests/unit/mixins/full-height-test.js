import Ember from 'ember';
import FullHeightMixin from '../../../mixins/full-height';
import { module, test } from 'qunit';

module('Unit | Mixin | full height');

// Replace this with your real tests.
test('it works', function(assert) {
  var FullHeightObject = Ember.Object.extend(FullHeightMixin);
  var subject = FullHeightObject.create();
  assert.ok(subject);
});
