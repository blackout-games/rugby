import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['fixture-ui-a'],
  
  href: Ember.computed('fixture',function(){
    return 'https://www.blackoutrugby.com/game/tools.live.scoring.php#fixture=' + this.get('fixture.id');
  }),
});
