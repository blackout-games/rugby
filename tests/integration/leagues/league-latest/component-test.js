import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leagues/league-latest', 'Integration | Component | league latest', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{leagues/league-latest}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#leagues/league-latest}}
      template block text
    {{/leagues/league-latest}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
