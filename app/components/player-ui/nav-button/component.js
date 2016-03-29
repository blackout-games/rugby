import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['player-nav','btn-events'],
  attributeBindings: ['aria-label'],
  
  'aria-label': Ember.computed('class',function(){
    return this.get('class')==='left' ? 'Previous player' : 'Next player';
  }),
  
  label: Ember.computed('class','currentPlayer',function(){
    return this.get('class')==='left' ? this.get('previousPlayer.shortName') : this.get('nextPlayer.shortName');
  }),
  
  previousPlayer: Ember.computed('currentPlayer',function(){
    let i = this.get('squad').indexOf(this.get('currentPlayer'));
    let num = this.get('squad.length');
    
    i--;
    if(i<0){
      i=num-1;
    }
    
    return this.get('squad').objectAt(i);
  }),
  
  nextPlayer: Ember.computed('currentPlayer',function(){
    let i = this.get('squad').indexOf(this.get('currentPlayer'));
    let num = this.get('squad.length');
    
    i++;
    if(i===num){
      i=0;
    }
    
    return this.get('squad').objectAt(i);
  }),
  
  click(){
    
    let newPlayer;
    if(this.get('class')==='left'){ // Previous
      newPlayer = this.get('previousPlayer');
    } else { // Next
      newPlayer = this.get('nextPlayer');
    }
    
    Ember.Blackout.transitionTo('players.player',newPlayer.get('id'));
    
    // Select sub-nav menu link
    this.get('eventBus').publish('selectSubNavLink','sub-menu-link-'+newPlayer.get('id'));
    
  },
  
});
