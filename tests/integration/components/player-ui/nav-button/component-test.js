import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-ui/nav-button', 'Integration | Component | player ui/nav button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-ui/nav-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-ui/nav-button}}
      template block text
    {{/player-ui/nav-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
