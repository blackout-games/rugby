import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dash-tabs/tabs-content', 'Integration | Component | dash tabs/tabs content', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dash-tabs/tabs-content}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dash-tabs/tabs-content}}
      template block text
    {{/dash-tabs/tabs-content}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
