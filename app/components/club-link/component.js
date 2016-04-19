import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  hasInit: false,
  
  setup: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('club') && this.get('session.isAuthenticated')){
        
        // Use current user club
        this.set('club',this.get('session.club'));
        
      }
      this.set('hasInit',true);
    }
  }),
  
  href: Ember.computed('club',function(){
    return 'https://www.blackoutrugby.com/game/club.lobby.php?id=' + this.get('club.id');
  }),
  
});
