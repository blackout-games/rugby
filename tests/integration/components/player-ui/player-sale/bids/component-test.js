import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-ui/player-sale/bids', 'Integration | Component | player ui/player sale/bids', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-ui/player-sale/bids}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-ui/player-sale/bids}}
      template block text
    {{/player-ui/player-sale/bids}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
