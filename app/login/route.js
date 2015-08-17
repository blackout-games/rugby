import Ember from 'ember';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';


export default Ember.Route.extend(UnauthenticatedRouteMixin,{
//export default Ember.Route.extend({
  
  actions: {
    goHome: function(){
      this.transitionTo('/');
    },
  },
  
});
