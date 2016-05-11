import Ember from 'ember';
import OAuth2 from 'ember-simple-auth/authenticators/oauth2-password-grant';
import config from '../config/environment';

const { RSVP, isEmpty, run } = Ember;
const assign = Ember.assign || Ember.merge;

export default OAuth2.extend({
  eventBus: Ember.inject.service(),
  locals: Ember.inject.service(),
  session: Ember.inject.service(),
  serverTokenEndpoint: config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/token?official',
  
  saveSessionData(response) {
    
    // Save basic auth data. Ember simple auth has forgotten it in the past
    this.get('locals').write('authRecover',response);
    
  },

  _refreshAccessToken(expiresIn, refreshToken) {
    //const data                = { 'grant_type': 'refresh_token', 'refresh_token': refreshToken };
    const serverTokenEndpoint = this.get('serverTokenEndpoint');
    return new RSVP.Promise((resolve, reject) => {
      
      // BLACKOUT START ----------- //
      
      LockableStorage.lockAndRunNow('oauthTokenRefresh', ()=>{
        
        // Get latest token (if we waited for task lock, and another tab received a new token in the meantime)
        let sessionRefreshToken = this.get('session.session.content.authenticated.refresh_token');
        if(sessionRefreshToken){
          refreshToken = sessionRefreshToken;
        }
        const data                = { 'grant_type': 'refresh_token', 'refresh_token': refreshToken };
        
      // BLACKOUT END ------------- //
      
        //this.makeRequest(serverTokenEndpoint, data).then((response) => {
        return this.makeRequest(serverTokenEndpoint, data).then((response) => {
          run(() => {
            expiresIn       = response['expires_in'] || expiresIn;
            refreshToken    = response['refresh_token'] || refreshToken;
            const expiresAt = this._absolutizeExpirationTime(expiresIn);
            const data      = assign(response, { 'expires_in': expiresIn, 'expires_at': expiresAt, 'refresh_token': refreshToken });
            this._scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
            this.trigger('sessionDataUpdated', data);
            resolve(data);
          });
        }, (xhr, status, error) => {
          Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
          reject();
          
          // BLACKOUT START ----------- //
          if(Number(xhr.status)===400){
            
            // If there is no current token, we have likely just loaded the page with an outdated token and there's no way we're going to get authenticated.
            let currentToken = this.get('session.session.content.authenticated.refresh_token');
            if(!currentToken){
              
              this.get('eventBus').publish('accessTokenWasNotRefreshedServer');
              
            } else {
              
              // Maybe there are multiple tabs open and another tab has already updated the token.
              // Check later to see if new refresh token has been received by another tab
              Ember.run.later(()=>{
                
                let newToken = this.get('session.session.content.authenticated.refresh_token');
                if(newToken===refreshToken){
                  
                  // Only call this event if server responded to avoid logouts simply from temparary loss of connection
                  this.get('eventBus').publish('accessTokenWasNotRefreshedServer');
                }
                
              },2000);
              
            }
          }
          // BLACKOUT END ------------- //
          
        });
        
        
      // BLACKOUT START ----------- //
      }, 5000, ()=>{
        reject();
      }); // Max lock hold
      // BLACKOUT END ------------- //
      
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
            response = assign(response, { 'expires_at': expiresAt });
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
    
    /**
     * Prevent auto re-authenticating
     * Probs just a simple-auth bug
     */
    let isLoggedOut = this.get('locals').read('isLoggedOut');
    if(isLoggedOut){
      return Ember.RSVP.reject();
      /*return new RSVP.Promise((resolve, reject) => {
        reject();
      });*/
    }
    
    // Auth recover
    if(Ember.$.isEmptyObject(data)){
      
      var auth = this.get('locals').read('authRecover');
      if(auth && !Ember.$.isEmptyObject(auth)){
        print("Session data was empty but can be restored");
        data = auth;
      }
      
    }
    
    return this._super(data).then((data)=>{
      return data;
    },()=>{
      print('session could not be restored');
      
      /**
       * Not sure why we waited.
       * If session can't be restored, we must logout immediately.
       * Otherwise the app will try an initiate things which could
       * rely on session data, and crash or stall before we even get
       * a chance to logout.
       */
      this.get('eventBus').publish('accessTokenWasNotRefreshedServer');
      /*Ember.run.next(()=>{
        this.get('eventBus').publish('accessTokenWasNotRefreshedServer');
      });*/
    });
    
  },
  
  invalidate(data) {
    this.get('locals').write('authRecover',null);
    return this._super(data);
  },
  
});
