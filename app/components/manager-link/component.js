import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  hasInit: false,
  defaultColor: 'light',
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('manager') && !this.get('managerId') && !this.get('managerUsername') && this.get('session.isAuthenticated')){
        
        // Use current manager
        this.set('manager',this.get('session.manager'));
        
      }
      this.set('hasInit',true);
    }
  }),
  
  href: Ember.computed('manager',function(){
    return 'https://www.blackoutrugby.com/game/me.lobby.php?id=' + this.get('manager.id');
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
        
        // Left mouse button only
        if(e.which!==1){
          return;
        }
        
        if(this.get('action')){
          this.sendAction();
          e.preventDefault();
        } else {
          window.location.href = this.get('href');
        }
        
      });
      
    }
    
  }),
  
  actions: {
    getManager(manager){
      this.set('manager',manager);
    },
  },
  
});
