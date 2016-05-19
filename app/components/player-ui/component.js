import Ember from 'ember';

export default Ember.Component.extend({
  
  user: Ember.inject.service(),
  
  classNames: ['show-overflow'],
  singleMode: false,
  flatTitleMode: false,
  
  actions: {
    tabChanged(tab){
      this.set('selectedTab',tab);
    },
  },
  
  playerIsOwned: Ember.computed('session.isAuthenticated','player',function(){
    
    return this.get('user').playerIsOwned(this.get('player'));
    
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    if(this.get('clickable')){
      
      let $box = this.$('.player-ui-squad-box');
      
      $box.on('click',()=>{
        Ember.Blackout.transitionTo('players.player',this.get('player.id'));
      });
      $box.css('cursor','pointer');
      
      $box.on('mouseenter touchstart',()=>{
        $box.addClass('active');
      });
      $box.on('mouseleave touchmove touchend',()=>{
        $box.removeClass('active');
      });
      
    }
  }),
  
  onDestroy: Ember.on('willDestroyElement',function(){
    if(this.get('clickable')){
      
      let $box = this.$('.player-ui-squad-box');
      $box.off('click mouseenter touchstart mouseleave touchmove touchend');
      
    }
  }),
  
});
