import Ember from 'ember';
import OAuth2 from 'ember-simple-auth/authenticators/oauth2-password-grant';
import config from '../config/environment';

const { RSVP, isEmpty, run } = Ember;

export default OAuth2.extend({
  eventBus: Ember.inject.service(),
  locals: Ember.inject.service(),
  serverTokenEndpoint: config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/token?official',
  
  saveSessionData(response) {
    
    // Save basic auth data. Ember simple auth has forgotten it in the past
    this.get('locals').write('authRecover',response);
    
  },

  _refreshAccessToken(expiresIn, refreshToken) {
    const data                = { 'grant_type': 'refresh_token', 'refresh_token': refreshToken };
    const serverTokenEndpoint = this.get('serverTokenEndpoint');
    return new RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        run(() => {
          expiresIn       = response['expires_in'] || expiresIn;
          refreshToken    = response['refresh_token'] || refreshToken;
          const expiresAt = this._absolutizeExpirationTime(expiresIn);
          const data      = Ember.merge(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'refresh_token': refreshToken });
          this._scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
          this.trigger('sessionDataUpdated', data);
          resolve(data);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
        
        // BLACKOUT START ----------- //
        this.get('eventBus').publish('accessTokenWasNotRefreshed');
        // BLACKOUT END ------------- //
      });
    });
  },
  
  authenticate(identification, password, scope = []) {
    return new RSVP.Promise((resolve, reject) => {
      const data                = { 'grant_type': 'password', username: identification, password };
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
  
  restore(data) {
    
    // Auth recover
    if(Ember.$.isEmptyObject(data)){
      
      var auth = this.get('locals').read('authRecover');
      if(auth && !Ember.$.isEmptyObject(auth)){
        print("Session data was empty but can be restored");
        //data = auth;
      }
      
    }
    
    return this._super(data).then((data)=>{
      return data;
    },()=>{
      print('session could not be restored');
      Ember.run.next(()=>{
        this.get('eventBus').publish('accessTokenWasNotRefreshed');
      });
    });
    
  },
  
  invalidate(data) {
    this.get('locals').write('authRecover',null);
    return this._super(data);
  },
  
});
