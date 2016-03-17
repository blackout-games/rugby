import Ember from 'ember';
import PatchInitializer from 'rugby-ember/initializers/patch';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | patch', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  PatchInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
