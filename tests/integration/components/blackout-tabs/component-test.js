import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('blackout-tabs', 'Integration | Component | blackout tabs', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{blackout-tabs}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#blackout-tabs}}
      template block text
    {{/blackout-tabs}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
