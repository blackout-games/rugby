import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import LoadingSliderMixin from '../mixins/loading-slider';
import FBMixin from '../mixins/fb';
import RouteHistoryMixin from 'ember-cli-history-mixin/mixins/route-history';

export default Ember.Route.extend(ApplicationRouteMixin, LoadingSliderMixin, FBMixin, RouteHistoryMixin, {
  locals: Ember.inject.service(),
  preferences: Ember.inject.service(),
  bites: Ember.inject.service(),
  
  listenForEvents: function(){

    /**
     * May need to remove this.
     * Otherwise users will be logged out a lot, even if it's just a temporary loss of connection.
    this.get('EventBus').subscribe('accessTokenWasNotRefreshed', this, function() {
      Ember.run.next(this,function(){
        this.send('sessionCouldNotBeRefreshed');
      });
    });
     */
    
  }.on('init'),
  
  sessionAuthenticated() {
    
    this.buildSession();
    
    var attemptedTrans = this.session.get('attemptedTransition');
    if (attemptedTrans) {
      attemptedTrans.retry();
      this.session.set('attemptedTransition', null);
    } else {

      var currentPath = window.location.pathname;
      var newPath = '/dashboard';
      
      var lastRoute = this.get('preferences').getPref('lastRoute');
      var lastRouteDate = this.get('preferences').getPref('lastRouteDate');
      
      if(lastRoute && lastRouteDate){
        
        var now = Date.now();
        lastRouteDate = new Date(lastRouteDate);
        
        // Use last route if last login was within 10 days
        if(now-lastRouteDate.getTime() < 10*24*60*60*1000){
          newPath = lastRoute;
        }
        
      }

      if (currentPath === newPath) {
        this.refresh();
      } else {
        this.transitionTo(newPath);
      }

    }
    
  },
  
  sessionInvalidated() {
    if (!Ember.testing) {
      window.location = '/';
    }
  },
  
  actions: {
    
    transitionToLoginRoute() {
      this.transitionTo('login');
    },
    
    sessionCouldNotBeRefreshed: function( /*error*/ ) {
      this.send('invalidateSession');
    },

    invalidateSession: function() {
      var self = this;
      
      Ember.$("#splash").fadeIn(222, function() {
        //Ember.$(this).hide();
        self.get('session').invalidate().then(function() {
          self.get('locals').put('standaloneFacebookDialogue', null);
          return false;
        });
      });

      return false;
    },

    loginWithFacebook: function(button) {
      this.loginToFB(button);
    },

    transitionToRoute: function(route) {
      this.transitionTo(route);
    },
    
    error: function(error, transition) {
      
      if(error.errors){
        return this.handleError(error.errors,transition);
      } else {
        return true;
      }
    },

  },
  
  handleError( errors/*, transition*/){
    // Handle blocked user
    if(errors.status && errors.status === '403' && errors.title && errors.title === 'Blocked'){
      this.transitionTo('blocked');
      return false;
    }
    
    return true;
    
  },

  buildSession: function() {

    var session = this.get('session');
    var store = this.get('store');
    var payload;

    // This may be an ember bug. We must encode and unencode the JSON payload to ensure there are no references to the payload passed into ember data. Ember data can create circular references on the object, which then cause errors when simple auth tries to JSON encode again for local storage.


    // Push manager payload into store
    var manager = session.get('data.authenticated.manager');
    if (manager) {

      payload = JSON.parse(JSON.stringify(manager));
      store.pushPayload(payload);


      // Set manager in session
      session.set('managerId', manager.data.id);
      session.set('manager', this.get('store').peekRecord('manager', manager.data.id));


      // Set manager metadata in session
      var meta;
      if (manager.meta) {
        meta = Ember.Object.create(manager.meta);
      } else {
        meta = null;
      }
      session.set('managerMeta', meta);


      // Push preferences payload into store
      var preferences = session.get('data.authenticated.preferences');
      payload = JSON.parse(JSON.stringify(preferences));
      store.pushPayload(payload);

      // Signify that the session has been built
      session.set('sessionBuilt', true);

    } else {

      Ember.warn('Session build was attempted, but manager was not available in session.secure');

    }

  },

  model: function() {

    /**
     * We don't actually load and return a model for use in the "application route".
     * We use this opportunity (while the app waits for us to resolve data) to check if the user is logged in, and if so, load the manager and club into ember data, along with user preferences, etc.
     */
    if (this.get('session.isAuthenticated')) {

      this.buildSession();

    } else {

      // Else just let the app load straight away

    }

    // Load and wait for preferences promise whether logged in or not
    return this.get('preferences').loadPreferences();

  },

});
