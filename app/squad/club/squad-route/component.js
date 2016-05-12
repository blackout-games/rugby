import Ember from 'ember';

export default Ember.Component.extend({
  preferences: Ember.inject.service(),
  
  /**
   * See initializers/route.js
   */
  stopLoader: Ember.on('didInsertElement',function(){
    Ember.Blackout.stopLoading();
  }),
  
  sortProps: Ember.computed('cache.squadSorting',function(){
    if(typeof this.get('cache.squadSorting') !== 'object'){
      let sort = this.get('preferences').getPref('squadSortBy', {camelize:true});
      let order = this.get('preferences').getPref('squadSortOrder', {lowercase:true});
      return [`${sort}:${order}`];
    } else {
      return this.get('cache.squadSorting');
    }
  }),
  
  playersSorted: Ember.computed.sort('model','sortProps'),
  
  defaultItemHeight: Ember.computed('media.isMobile',function(){
    return this.get('media.isMobile') ? 620 : 800;
  }),
  
});
