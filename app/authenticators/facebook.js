import Ember from 'ember';
import BlackoutAuth from './blackout';

export default BlackoutAuth.extend({
  
  /**
   * Based on the OAuth2 authenticator, just with the option names changes, and grant_type changed to facebook
   * @param  {object} options Object with the options as properties
   * @return {RSVP.Promise}
   */
  authenticate(options) {
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var data = { grant_type: 'facebook', redirect_uri: options.redirect_uri, auth_code: options.auth_code };
      if (!Ember.isEmpty(options.scope)) {
        var scopesString = Ember.makeArray(options.scope).join(' ');
        Ember.merge(data, { scope: scopesString });
      }
      _this.makeRequest(_this.serverTokenEndpoint, data).then(function(response) {
        
        _this.buildSession(response);
        
        Ember.run(function() {
          var expiresAt = _this.absolutizeExpirationTime(response.expires_in);
          _this.scheduleAccessTokenRefresh(response.expires_in, expiresAt, response.refresh_token);
          if (!Ember.isEmpty(expiresAt)) {
            response = Ember.merge(response, { expires_at: expiresAt });
          }
          resolve(response);
        });
      }, function(xhr/*, status, error*/) {
        Ember.run(function() {
          reject(xhr.responseJSON || xhr.responseText);
        });
      });
    });
  },
  
});
