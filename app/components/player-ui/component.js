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
  
});
