import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('blackout-tabs/tab-list/tab', 'Integration | Component | blackout tabs/tab list/tab', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{blackout-tabs/tab-list/tab}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#blackout-tabs/tab-list/tab}}
      template block text
    {{/blackout-tabs/tab-list/tab}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
