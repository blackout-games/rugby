import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    sessionAuthenticationSucceeded: function() {
      var attemptedTrans = this.session.get('attemptedTransition');
      if(attemptedTrans){
        attemptedTrans.retry();
        this.session.set('attemptedTransition',null);
      } else {
        this.transitionTo('manager');
      }
    },
    sessionAuthenticationFailed: function(error) {
      this.controllerFor('login').set('loginErrorMessage', error.message);
    },
  }
});
