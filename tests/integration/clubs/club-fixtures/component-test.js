import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('clubs/club-fixtures', 'Integration | Component | club fixtures', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{clubs/club-fixtures}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#clubs/club-fixtures}}
      template block text
    {{/clubs/club-fixtures}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
