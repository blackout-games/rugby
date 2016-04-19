import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['inline-block'],
  imageSize: 'medium',
  tagName: 'span',
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
  
});
