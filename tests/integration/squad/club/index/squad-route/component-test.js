import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('squad/club/index/squad-route', 'Integration | Component | squad route', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{squad/club/index/squad-route}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#squad/club/index/squad-route}}
      template block text
    {{/squad/club/index/squad-route}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
