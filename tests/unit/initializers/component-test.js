import Ember from 'ember';
import ComponentInitializer from '../../../initializers/component';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | component', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ComponentInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
