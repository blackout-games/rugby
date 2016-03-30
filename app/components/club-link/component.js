import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  
  href: Ember.computed('club',function(){
    return 'https://www.blackoutrugby.com/game/club.lobby.php?id=' + this.get('club.id');
  }),
  
});
