import Ember from 'ember';
import BlackoutAuth from './blackout';

const { RSVP, isEmpty, run } = Ember;

export default BlackoutAuth.extend({
  
  
  /**
   * Based on the OAuth2 authenticator, just with the option names changes, and grant_type changed to facebook
   */
  authenticate(identification, password, scope = []) {
    return new RSVP.Promise((resolve, reject) => {
      
      // BLACKOUT START ----------- //
      const data                = { 'grant_type': 'facebook-connect', access_token: password };
      // BLACKOUT END ------------- //
      
      const serverTokenEndpoint = this.get('serverTokenEndpoint');
      const scopesString = Ember.makeArray(scope).join(' ');
      if (!Ember.isEmpty(scopesString)) {
        data.scope = scopesString;
      }
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
          this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
          if (!isEmpty(expiresAt)) {
            response = Ember.merge(response, { 'expires_at': expiresAt });
          }
          
          // BLACKOUT START ----------- //
          this.saveSessionData(response);
          // BLACKOUT END ------------- //
          
          resolve(response);
        });
      }, (xhr) => {
        run(null, reject, xhr.responseJSON || xhr.responseText);
      });
    });
  },
  
});
