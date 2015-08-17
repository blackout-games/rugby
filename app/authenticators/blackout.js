import Ember from 'ember';
import OAuth2 from 'simple-auth-oauth2/authenticators/oauth2';
import Local from '../models/local';

export default OAuth2.extend({
  EventBus: Ember.inject.service('event-bus'),
  locals: Local.create(),
  
  buildSession: function(response){
    
    var store = this.container.lookup('service:store');
    var session = this.container.lookup('session:blackout');
    
    // This may be an ember bug. We must encode and unencode the JSON payload to ensure there are no references to the payload passed into ember data. Ember data can create circular references on the object, which then cause errors when simple auth tries to JSON encode again for local storage.
    
    // Push manager payload into store
    var payload = JSON.parse(JSON.stringify(response.manager));
    store.pushPayload(payload);
    
    // Set manager in session
    session.set('managerId',response.manager.data.id);
    session.set('manager',store.peekRecord('manager',response.manager.data.id));
    
    var meta = Ember.Object.create(response.manager.meta);
    session.set('managerMeta',meta);
    
    // Save basic auth data. Ember simple auth has forgotten it in the past
    this.set('locals.authRecover',response);
    
    // Push preferences payload into store
    var payload = JSON.parse(JSON.stringify(response.preferences));
    store.pushPayload(payload);
    
    // Signify that the session has been built
    session.set('sessionBuilt',true);
    
  },
  
  restoreSession: function(response,App,session){
    
    var store = this.container.lookup('service:store');
    
    // Load fresh data
    // Must run next, to ensure bearer token is sent
    Ember.run.next(function(){
      Ember.RSVP.hash({
        manager: store.query('manager',{ ids: [response.manager.data.id], include: 'clubs' }, {reload: true}),
        preferences: store.findAll('preference', {reload: true}),
      }).then(function(data){
        
        var meta = Ember.Object.create(data.manager.get('meta'));
        session.set('managerMeta',meta);
        
        App.advanceReadiness();
      });
    });
    
  },
  
  refreshAccessToken: function(expiresIn, refreshToken) {
    var _this = this;
    var data  = { grant_type: 'refresh_token', refresh_token: refreshToken };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      _this.makeRequest(_this.serverTokenEndpoint, data).then(function(response) {
        Ember.run(function() {
          expiresIn     = response.expires_in || expiresIn;
          refreshToken  = response.refresh_token || refreshToken;
          var expiresAt = _this.absolutizeExpirationTime(expiresIn);
          var data      = Ember.merge(response, { expires_in: expiresIn, expires_at: expiresAt, refresh_token: refreshToken });
          _this.scheduleAccessTokenRefresh(expiresIn, null, refreshToken);
          _this.trigger('sessionDataUpdated', data);
          resolve(data);
        });
      }, function(xhr, status, error) {
        Ember.Logger.warn('Access token could not be refreshed - server responded with ' + error + '.');
        reject();
        _this.get('EventBus').publish('accessTokenWasNotRefreshed');
      });
    });
  },
  
  authenticate: function(options) {
    var _this = this;
    
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var data = { grant_type: 'password', username: options.identification, password: options.password };
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
      }, function(xhr, status, error) {
        Ember.run(function() {
          reject(xhr.responseJSON || xhr.responseText);
        });
      });
    });
  },
  
  restore: function(data){
    var self = this;
    
    // Prevent app from starting yet
    var App = this.container.lookup('application:main');
    App.deferReadiness();
    
    // Prevent things from running if we need to
    var session = this.container.lookup('session:blackout');
    session.set('isRestoring',true);
    
    // Auth recover
    if(Ember.$.isEmptyObject(data)){
      
      var auth = this.get('locals.authRecover');
      if(auth && !Ember.$.isEmptyObject(auth)){
        print("Session data was restored");
        data = auth;
      }
      
    }
    
    return this._super(data).then(function(data){
      self.restoreSession(data,App,session);
      session.set('isRestoring',false);
      return data;
    },function(){
      App.advanceReadiness();
      session.set('isRestoring',false);
      print('session could not be restored');
      Ember.run.next(function(){
        self.get('EventBus').publish('accessTokenWasNotRefreshed');
      });
    });
    
  },
  
  invalidate: function(data) {
    this.set('locals.authRecover',null);
    return this._super(data);
  },
  
});
