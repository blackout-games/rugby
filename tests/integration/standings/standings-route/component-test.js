import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('standings/standings-route', 'Integration | Component | standings route', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{standings/standings-route}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#standings/standings-route}}
      template block text
    {{/standings/standings-route}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
