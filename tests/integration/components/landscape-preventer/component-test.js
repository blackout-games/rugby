import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('landscape-preventer', 'Integration | Component | landscape preventer', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{landscape-preventer}}`);

  assert.equal(this.$().text(), '');

  // Template block usage:
  this.render(hbs`
    {{#landscape-preventer}}
      template block text
    {{/landscape-preventer}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
