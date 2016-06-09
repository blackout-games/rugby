import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('league-country/country-route', 'Integration | Component | country route', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{league-country/country-route}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#league-country/country-route}}
      template block text
    {{/league-country/country-route}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
