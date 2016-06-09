import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leagues/nav-button', 'Integration | Component | nav button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{leagues/nav-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#leagues/nav-button}}
      template block text
    {{/leagues/nav-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
