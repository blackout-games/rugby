import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  imageSize: 'medium',
  hasInit: false,
  fast: false,
  defaultColor: 'light',
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('club') && !this.get('clubId') && this.get('session.isAuthenticated')){
        
        // Use current user club
        this.set('club',this.get('session.club'));
        
      }
      
      this.set('hasInit',true);
    }
  }),
  
  href: Ember.computed('club','nat','u20',function(){
    if(this.get('nat')){
      return 'https://www.blackoutrugby.com/game/global.national.php?iso=' + this.get('club.country.id') + '&type=1';
    } else if(this.get('u20')){
      return 'https://www.blackoutrugby.com/game/global.national.php?iso=' + this.get('club.country.id') + '&type=2';
    } else {
      return 'https://www.blackoutrugby.com/game/club.lobby.php?id=' + this.get('club.id');
    }
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
    getClub(club){
      this.set('club',club);
    },
  },
  
});
