import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  tagName: 'a',
  attributeBindings: ['href'],
  classNames: ['btn-a'],
  hasInit: false,
  fast: false,
  
  href: Ember.computed('item',function(){
    
    if(this.get('type') === 'election'){
      
      return 'https://www.blackoutrugby.com/game/global.lobby.php?iso=' + this.get('item.country.id') + '#page=elections&iso=' + this.get('item.country.id') + '&election=' + this.get('item.id');
      
    } else if(this.get('type') === 'player'){
      
      return 'https://www.blackoutrugby.com/game/club.squad.php#player=' + this.get('item.id');
      
    } else if(this.get('type') === 'youth-player'){
      
      return 'https://www.blackoutrugby.com/game/club.squad.youth.php#player=' + this.get('item.id');
      
    } else if(this.get('type') === 'country'){
      
      return 'https://www.blackoutrugby.com/game/global.lobby.php?iso=' + this.get('item.id');
      
    } else {
      Ember.Logger.warn('Unknown type ('+this.get('type')+') in item-link.');
      return '';
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
    getItem(item){
      this.set('item',item);
    },
  },
  
});
