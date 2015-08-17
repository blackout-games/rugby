import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
//export default Ember.Route.extend({
  model: function() {
    return this.store.peekRecord('manager',this.session.get('managerId'));;
  },
});