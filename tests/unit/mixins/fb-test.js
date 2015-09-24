import Ember from 'ember';
import FbMixin from '../../../mixins/fb';
import { module, test } from 'qunit';

module('Unit | Mixin | fb');

// Replace this with your real tests.
test('it works', function(assert) {
  var FbObject = Ember.Object.extend(FbMixin);
  var subject = FbObject.create();
  assert.ok(subject);
});
