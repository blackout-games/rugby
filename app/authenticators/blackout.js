import Ember from 'ember';
import OAuth2 from 'ember-simple-auth/authenticators/oauth2-password-grant';
import config from '../config/environment';

export default OAuth2.extend({
  EventBus: Ember.inject.service('event-bus'),
  locals: Ember.inject.service(),
  serverTokenEndpoint: config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/token?official',
  
  saveSessionData: function(response){
    
    // Save basic auth data. Ember simple auth has forgotten it in the past
    this.get('locals').put('authRecover',response);
    
  },
  
  
  refreshAccessToken(expiresIn, refreshToken) {
    const data                = { 'grant_type': 'refresh_token', 'refresh_token': refreshToken };
    const serverTokenEndpoint = this.get('serverTokenEndpoint');
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.makeRequest(serverTokenEndpoint, data).then((response) => {
        Ember.run(() => {
          expiresIn       = response['expires_in'] || expiresIn;
          refreshToken    = response['refresh_token'] || refreshToken;
          const expiresAt = this.absolutizeExpirationTime(expiresIn);
          const data      = Ember.merge(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'refresh_token': refreshToken });
          this.scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
          this.trigger('sessionDataUpdated', data);
          resolve(data);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
        
        // BLACKOUT START ----------- //
        this.get('EventBus').publish('accessTokenWasNotRefreshed');
        // BLACKOUT END ------------- //
        
      });
    });
  },
  
  
  authenticate(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const data                = { 'grant_type': 'password', username: options.identification, password: options.password };
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
  
  
  restore: function(data){
    var self = this;
    
    // Auth recover
    if(Ember.$.isEmptyObject(data)){
      
      var auth = this.get('locals').read('authRecover');
      if(auth && !Ember.$.isEmptyObject(auth)){
        print("Session data was empty but can be restored");
        //data = auth;
      }
      
    }
    
    return this._super(data).then(function(data){
      return data;
    },function(){
      print('session could not be restored');
      Ember.run.next(function(){
        self.get('EventBus').publish('accessTokenWasNotRefreshed');
      });
    });
    
  },
  
  invalidate: function(data) {
    this.get('locals').put('authRecover',null);
    return this._super(data);
  },
  
});
