import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('clubs/logo-editor', 'Integration | Component | logo editor', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{clubs/logo-editor}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#clubs/logo-editor}}
      template block text
    {{/clubs/logo-editor}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
