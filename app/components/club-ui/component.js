import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['inline-block','club-ui'],
  imageSize: 'medium',
  tagName: 'span',
  hasInit: false,
  defaultColor: 'dark',
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('club') && this.get('session.isAuthenticated')){
        
        // Use current user club
        this.set('club',this.get('session.club'));
        
      }
      this.set('hasInit',true);
      
    }
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('inline')){
      this.$().css('margin-right','-3px');
    }
    
  }),
  
});
