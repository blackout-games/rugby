import Session from "simple-auth/session";

var BlackoutSession = Session.extend({
  managerId: function() {
    return this.get('secure.manager.data.id');
  }.property('secure.manager')
});

export default {
  name: 'authentication',
  before: "simple-auth",
  initialize: function(container) {
    container.register('session:blackout', BlackoutSession);
  }
};