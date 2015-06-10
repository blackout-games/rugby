import Ember from 'ember';

export default Ember.Controller.extend({
  scrollContextId: function(){
    return window.features.lockBody ? 'body' : null;
  }.property('window.features.lockBody'),
  waypointOffset: function(){
    return Math.round(Ember.$(window).height()*0.5);
  }.property(),
});
