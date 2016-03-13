import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['show-overflow'],
  singleMode: false,
  flatTitleMode: false,
  
  actions: {
    tabChanged(tab){
      this.set('selectedTab',tab);
    },
  },
  
});
