import { moduleForModel, test } from 'ember-qunit';

moduleForModel('national-news', 'Unit | Model | national news', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});
