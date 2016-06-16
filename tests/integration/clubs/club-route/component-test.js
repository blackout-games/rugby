import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('clubs/club-route', 'Integration | Component | club route', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{clubs/club-route}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#clubs/club-route}}
      template block text
    {{/clubs/club-route}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
