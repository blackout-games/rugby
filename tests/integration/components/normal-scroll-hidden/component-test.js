import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('normal-scroll-hidden', 'Integration | Component | normal scroll hidden', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{normal-scroll-hidden}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#normal-scroll-hidden}}
      template block text
    {{/normal-scroll-hidden}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
