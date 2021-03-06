import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('blackout-tab-selector', 'Integration | Component | blackout tab selector', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{blackout-tab-selector}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#blackout-tab-selector}}
      template block text
    {{/blackout-tab-selector}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
