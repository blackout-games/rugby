import Ember from 'ember';
import LoadingSliderMixin from '../../../mixins/loading-slider';
import { module, test } from 'qunit';

module('Unit | Mixin | loading slider');

// Replace this with your real tests.
test('it works', function(assert) {
  let LoadingSliderObject = Ember.Object.extend(LoadingSliderMixin);
  let subject = LoadingSliderObject.create();
  assert.ok(subject);
});
