import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  
  model(){
    let managerId = this.get('session.data.managerId');
    return this.get('store').findRecord('manager',managerId);
    
  },
  
});
