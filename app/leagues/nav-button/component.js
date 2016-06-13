import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'button',
  classNames: ['btn','btn-circle','btn-appear','menu-link','custom'],
  classNameBindings: ['isDisabled:disabled'],
  attributeBindings: ['id'],
  
  click(e){
    
    /*let leagueId = this.get('leagueId');
    if(leagueId){
      Ember.Blackout.transitionTo('leagues.league',leagueId);
    }*/
    
    // This happens in components/sub-nav
    e.preventDefault();
    
  },
  
  id: Ember.computed('league',function(){
    return 'sub-menu-link-' + this.get('leagueId');
  }),
  
  leagueId: Ember.computed('league',function(){
    let direction = this.get('direction');
    let leagueId;
    
    if(direction==='left'){
      leagueId = this.get('league.navLeft');
    } else if(direction==='up'){
      leagueId = this.get('league.navAbove');
    } else if(direction==='down'){
      leagueId = this.get('league.navBelow');
    } else { // Right
      leagueId = this.get('league.navRight');
    }
    
    return leagueId;
  }),
  
  isDisabled: Ember.computed('league',function(){
    let leagueId = this.get('leagueId');
    let isDisabled = Ember.isEmpty(leagueId);
    return isDisabled;
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    this.updateDisabled();
  }),
  
  onReceive: Ember.on('didUpdateAttrs',function(attrs){
    if(this.attrChanged(attrs,'league')){
      this.updateDisabled();
    }
  }),
  
  updateDisabled(){
    let isDisabled = this.get('isDisabled');
    if(isDisabled){
      this.$().prop('disabled','disabled');
    } else {
      this.$().prop('disabled',false);
    }
  },
  
});
