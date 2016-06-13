import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('infinite-scroll-horizontal/item', 'Integration | Component | infinite scroll horizontal/item', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{infinite-scroll-horizontal/item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#infinite-scroll-horizontal/item}}
      template block text
    {{/infinite-scroll-horizontal/item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
