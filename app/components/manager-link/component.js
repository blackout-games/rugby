import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  hasInit: false,
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('manager') && this.get('session.isAuthenticated')){
        
        // Use current manager
        this.set('manager',this.get('session.manager'));
        
      }
      this.set('hasInit',true);
    }
  }),
  
  href: Ember.computed('manager',function(){
    return 'https://www.blackoutrugby.com/game/me.lobby.php?id=' + this.get('manager.id');
  }),
  
});
