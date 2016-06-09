import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('leagues/league-fixtures', 'Integration | Component | league fixtures', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{leagues/league-fixtures}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#leagues/league-fixtures}}
      template block text
    {{/leagues/league-fixtures}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
