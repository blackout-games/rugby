import Ember from 'ember';
import BlackoutAuth from './blackout';

export default BlackoutAuth.extend({
  
  
  /**
   * Based on the OAuth2 authenticator, just with the option names changes, and grant_type changed to facebook
   */
  authenticate(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const data                = { 'grant_type': 'facebook-connect', access_token: options.accessToken };
      const serverTokenEndpoint = this.get('serverTokenEndpoint');
      if (!Ember.isEmpty(options.scope)) {
        const scopesString = Ember.makeArray(options.scope).join(' ');
        Ember.merge(data, { scope: scopesString });
      }
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        Ember.run(() => {
          const expiresAt = this.absolutizeExpirationTime(response['expires_in']);
          this.scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
          if (!Ember.isEmpty(expiresAt)) {
            response = Ember.merge(response, { 'expires_at': expiresAt });
          }
          
          // BLACKOUT START ----------- //
          this.saveSessionData(response);
          // BLACKOUT END ------------- //
          
          
          resolve(response);
        });
      }, (xhr) => {
        Ember.run(null, reject, xhr.responseJSON || xhr.responseText);
      });
    });
  },
  
});
