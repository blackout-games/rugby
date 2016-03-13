import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * See initializers/route.js
   */
  stopLoader: Ember.on('didInsertElement',function(){
    Ember.Blackout.stopLoading();
  }),
  
});
