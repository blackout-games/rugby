import Ember from 'ember';

export default Ember.Controller.extend({
  
  primaryMaster: function(){
    if (window.navigator.standalone) {
      return Ember.Blackout.getCSSValue('color','loading-slider-standalone');
    } else {
      return Ember.Blackout.getCSSValue('color','loading-slider');
    }
  }.property(),
  
});
