import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('player-ui/player-manage/personalisation', 'Integration | Component | player ui/player manage/personalisation', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{player-ui/player-manage/personalisation}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#player-ui/player-manage/personalisation}}
      template block text
    {{/player-ui/player-manage/personalisation}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
