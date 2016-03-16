import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';


export default Ember.Route.extend(UnauthenticatedRouteMixin,{
//export default Ember.Route.extend({
  
  removeBackground: Ember.on('activate', function(){
    this.get('eventBus').publish('removeBackground');
  }),

  actions: {
    goHome() {
      this.transitionTo('/');
    },
  },

});
