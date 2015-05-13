import Session from "simple-auth/session";

export function initialize() {
  Session.reopen({
    manager: function() {
      return this.get("secure.manager");
    }.property("secure.access_token"), // secure.* is updated whenever a token is updated
  });
}

export default {
  name: 'authentication',
  before: "simple-auth",
  initialize: initialize
};
