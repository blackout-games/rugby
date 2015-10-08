import Ember from 'ember';

export default Ember.Controller.extend({
  
  loadingSliderColor: Ember.computed(function(){
    return Ember.Blackout.getCSSValue('color','loading-slider');
  }),
  
});
