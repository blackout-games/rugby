import Ember from 'ember';

export default Ember.Component.extend({
  preferences: Ember.inject.service(),
  
  sortProps: Ember.computed('cache.squadSorting',function(){
    if(typeof this.get('cache.squadSorting') !== 'object'){
      let sort = this.get('preferences').getPref('squadSortBy', {camelize:true});
      let order = this.get('preferences').getPref('squadSortOrder', {lowercase:true});
      return [`${sort}:${order}`];
    } else {
      return this.get('cache.squadSorting');
    }
  }),
  
  playersSorted: Ember.computed.sort('squad','sortProps'),
  
  classNames: ['player-nav','btn-events'],
  attributeBindings: ['aria-label'],
  
  'aria-label': Ember.computed('class',function(){
    return this.get('class')==='left' ? 'Previous player' : 'Next player';
  }),
  
  label: Ember.computed('class','currentPlayer','playersSorted',function(){
    return this.get('class')==='left' ? this.get('previousPlayer.shortName') : this.get('nextPlayer.shortName');
  }),
  
  previousPlayer: Ember.computed('currentPlayer','playersSorted',function(){
    let i = this.get('playersSorted').indexOf(this.get('currentPlayer'));
    let num = this.get('playersSorted.length');
    
    i--;
    if(i<0){
      i=num-1;
    }
    
    return this.get('playersSorted').objectAt(i);
  }),
  
  nextPlayer: Ember.computed('currentPlayer','playersSorted',function(){
    let i = this.get('playersSorted').indexOf(this.get('currentPlayer'));
    let num = this.get('playersSorted.length');
    
    i++;
    if(i===num){
      i=0;
    }
    
    return this.get('playersSorted').objectAt(i);
  }),
  
  click(){
    
    let newPlayer;
    if(this.get('class')==='left'){ // Previous
      newPlayer = this.get('previousPlayer');
    } else { // Next
      newPlayer = this.get('nextPlayer');
    }
    
    // Select sub-nav menu link
    this.get('eventBus').publish('selectSubNavLink','sub-menu-link-'+newPlayer.get('id'));
    
  },
  
});
