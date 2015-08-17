import Ember from 'ember';
import FormValidationsMixin from '../../../mixins/form-validations';
import { module, test } from 'qunit';

module('Unit | Mixin | form validations');

// Replace this with your real tests.
test('it works', function(assert) {
  var FormValidationsObject = Ember.Object.extend(FormValidationsMixin);
  var subject = FormValidationsObject.create();
  assert.ok(subject);
});
