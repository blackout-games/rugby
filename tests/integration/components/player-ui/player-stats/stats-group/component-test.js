import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-ui/player-stats/stats-group', 'Integration | Component | player ui/player stats/stats group', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{player-ui/player-stats/stats-group}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#player-ui/player-stats/stats-group}}
      template block text
    {{/player-ui/player-stats/stats-group}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
