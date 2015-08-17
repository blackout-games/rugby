import Ember from 'ember';
import NewsMixin from '../../../mixins/news';
import { module, test } from 'qunit';

module('Unit | Mixin | news');

// Replace this with your real tests.
test('it works', function(assert) {
  var NewsObject = Ember.Object.extend(NewsMixin);
  var subject = NewsObject.create();
  assert.ok(subject);
});
