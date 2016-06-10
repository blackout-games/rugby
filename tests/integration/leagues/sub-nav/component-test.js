import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leagues/sub-nav', 'Integration | Component | sub nav', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{leagues/sub-nav}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#leagues/sub-nav}}
      template block text
    {{/leagues/sub-nav}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
