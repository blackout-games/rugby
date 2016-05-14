import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  hasInit: false,
  fast: false,
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
  
  href: Ember.computed('club',function(){
    return 'https://www.blackoutrugby.com/game/club.lobby.php?id=' + this.get('club.id');
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    
    if(this.get('fast')){
      
      this.$().on('mousedown touchstart',(e)=>{
        
        // Left mouse button only
        if(e.type==='mousedown' && e.which!==1){
          return;
        }
        
        if(this.get('action')){
          this.sendAction();
        } else {
          window.location.href = this.get('href');
        }
        
      });
      
      this.$().on('click',(e)=>{
        e.preventDefault();
      });
      
    } else {
      
      this.$().on('click',(e)=>{
        
        if(this.get('action')){
          this.sendAction();
          e.preventDefault();
        } else {
          window.location.href = this.get('href');
        }
        
      });
      
    }
    
  }),
  
});
