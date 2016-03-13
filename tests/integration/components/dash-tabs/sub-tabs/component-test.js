import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('components/dash-tabs/sub-tabs', 'Integration | Component | sub tabs', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{components/dash-tabs/sub-tabs}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#components/dash-tabs/sub-tabs}}
      template block text
    {{/components/dash-tabs/sub-tabs}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
