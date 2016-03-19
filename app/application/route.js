import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import LoadingSliderMixin from '../mixins/loading-slider';
import FbMixin from '../mixins/fb';
import RouteHistoryMixin from 'ember-cli-history-mixin/mixins/route-history';
import config from '../config/environment';
//import { translationMacro as t } from "ember-i18n";
import t from "../utils/translation-macro";

const { $ } = Ember;

export default Ember.Route.extend(ApplicationRouteMixin, LoadingSliderMixin, RouteHistoryMixin, FbMixin, {
  locals: Ember.inject.service(),
  preferences: Ember.inject.service(),
  bites: Ember.inject.service(),
  locale: Ember.inject.service(),
  user: Ember.inject.service(),
  info: Ember.inject.service(),
  
  listenForEvents: Ember.on('init', function(){

    /**
     * Only call this event if server is reachable to avoid logouts during temporary loss of connection
     */
    this.get('eventBus').subscribe('accessTokenWasNotRefreshedServer', this, this.invalidateSession );
    
  }),
  
  sessionAuthenticated() {
    
    this.buildSession();
    
    var attemptedTrans = this.session.get('data.attemptedTransition');
    if (attemptedTrans) {
      attemptedTrans.retry();
      this.session.set('data.attemptedTransition', null);
    } else {

      var newPath = '/dashboard';
      
      var lastRoute = this.get('preferences').getPref('lastRoute');
      var lastRouteDate = this.get('preferences').getPref('lastRouteDate');
      
      if(lastRoute && lastRouteDate){
        
        var now = Date.now();
        lastRouteDate = new Date(lastRouteDate);
        
        // Use last route if last login was within 10 days
        if(now-lastRouteDate.getTime() < 10*24*60*60*1000){
          newPath = lastRoute;
          if( newPath === '/' ){
            newPath = '/dashboard';
          }
        }
        
      }

      Ember.Blackout.transitionTo(newPath);

    }
    
  },
  
  invalidateSession() {
    
    Ember.$('#splash').show().removeClass('bounceOutLeft fadeOut').addClass('animated-fast fadeIn');
    
    Ember.$("#splash").off( Ember.Blackout.afterCSSAnimation ).on(Ember.Blackout.afterCSSAnimation, ()=> {
      //Ember.$(this).hide();
      this.get('session').invalidate().then(()=>{
        this.get('locals').write('standaloneFacebookDialogue', null);
        return false;
      });
      Ember.$('#splash').off( Ember.Blackout.afterCSSAnimation );
    });
    
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

    invalidateSession() {
      
      this.invalidateSession();
      return false;
      
    },

    loginWithFacebook(button) {
      this.loginToFB(button);
    },

    transitionToRoute(route,id) {
      if(id){
        this.transitionTo(route,id);
      } else {
        this.transitionTo(route);
      }
    },
    
    error(error, transition) {
      
      if(error.errors){
        return this.handleError(error.errors,transition);
      } else {
        return true;
      }
            
    },

  },
  
  handleError( error/*, transition*/){
    
    // Handle multiple error types
    if(!error.status && error.length>0 && error[0].status){
      error = error[0];
    }
    
    if(error.status){
      
      if (error.status === '0') {
          
          this.modal.show({
            type: 'error',
            title: t('modals.no-connection.title'),
            message: t('modals.no-connection.message'),
            showDefaultAction: false,
            callback: Ember.Blackout.stopLoading,
          });
          
          //Ember.Blackout.stopLoading();
          
      } else if (error.status === '401') {
        
          //TODO: handle 401
          
      } else if (error.status === '403') {
          
          // Handle blocked user
          if(error.title && error.title === 'Blocked'){
            this.transitionTo('blocked');
          } else {
            //TODO: handle general 403
          }
          
      } else if (error.status === '404') {
          this.transitionTo('nope');
          return false;
      } else {
        
          log(error);
          
      }
      
      return false;
      
    }
    
    return true;
    
  },

  buildSession(transition) {
    var session = this.get('session');
    var store = this.get('store');
    var payload;

    // This may be an ember bug. We must encode and unencode the JSON payload to ensure there are no references to the payload passed into ember data. Ember data can create circular references on the object, which then cause errors when simple auth tries to JSON encode again for local storage.

    // DONT use data.sessionBuilt so that this variable is cleared on reload
    let sessionRebuilt = session.get('sessionRebuilt');
    if(sessionRebuilt){
      Ember.Logger.warn('Session manager has been refreshed since initial login, but buildSession was called again');
      return;
    }
    
    // Push manager payload into store
    let manager = session.get('data.authenticated.manager');
    
    if (manager) {
      
      payload = JSON.parse(JSON.stringify(manager));
      store.pushPayload(payload);
      
      // ------ Set manager in session
      
      session.set('data.managerId', manager.data.id);
      let newManager = this.get('store').peekRecord('manager', manager.data.id);
      newManager = newManager.toJSON({ includeId: true });
      session.set('data.manager', newManager);
      
      // ------ Set manager metadata in session
      
      var meta;
      if (manager.meta) {
        meta = Ember.Object.create(manager.meta);
      } else {
        meta = null;
      }
      session.set('data.managerMeta', meta);


      // ------ Push preferences payload into store
      
      var preferences = session.get('data.authenticated.preferences');
      payload = JSON.parse(JSON.stringify(preferences));
      store.pushPayload(payload);

      // ------ Signify that the session has been built
      // DONT use data.sessionBuilt so that this variable is cleared on reload
      session.set('sessionBuilt', true);
      
      // ------ Check for later version of manager
      
      let managerLatest = session.get('data.sessionManagerLatest');
      
      if(managerLatest){
        this.get('user').rebuildSession(managerLatest);
      } else {
        // Let the world know user has logged in and session is complete
        this.eventBus.publish('sessionBuilt');
      }

    } else {

      Ember.Logger.warn('Session build was attempted, but manager was not available in session.data.authenticated');
      var auth = this.get('locals').read('authRecover');
      if(!auth && transition){
        this.invalidateSession();
      }
    }

  },
  
  clearSessionData(){
    
    let session = this.get('session');
    let data = session.get('data');
    $.each(data,(key)=>{
      
      if(key !== 'authenticated' && key !== 'releaseMarker'){
        session.set('data.'+key,undefined);
      }
      
    });
    
  },

  beforeModel( transition ) {
    
    /**
     * Maintenance/resets on new releases.
     * 
     * Change this if you need to clear session data, local storage, etc. for a new release.
     */
    let releaseMarker = 11;
    
    let session = this.get('session');
    let oldReleaseMarker = session.get('data.releaseMarker');
    
    if(!oldReleaseMarker || oldReleaseMarker<releaseMarker){
      
      this.get('locals').write('authRecover',null);
      
      if(this.get('session.isAuthenticated')){
        this.invalidateSession();
      } else {
        session.set('data.releaseMarker',releaseMarker);
        this.clearSessionData();
      }
      
    }

    /**
     * At this stage we don't actually load and return a model for use in the "application route".
     * We use this opportunity (while the app waits for us to resolve data) to run other data retrieval tasks while the app boots up. This is recommended by ember to be done here instead of during app initializers with deferAppReadiness etc.
     * http://guides.emberjs.com/v2.1.0/applications/initializers/
     *
     */
    
    let hash = {
      
      // Load and wait for preferences promise whether logged in or not
      info: this.get('info').initInfo(),
      
      // Load and wait for preferences promise whether logged in or not
      preferences: this.get('preferences').loadPreferences(),
      
      // Load general i18n document
      translation: this.get('locale').initLocale(),
      
    };
    
    /**
     * Check for browser default locale using the server
     */
    
    let locale = this.get('locals').read('locale');
    
    // If a locale has not been set before
    if(Ember.isEmpty(locale)){
      
      // Check browser locale
      let url = config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/headers/Accept-Language';
      
      hash.browserLocale = Ember.$.getJSON(url,function(data){
        if( data && data.data && data.data.id === 'Accept-Language' ){
          window.blackout.languageHeader = data.data.attributes.value;
        }
        
      });
      
    }
    
    
    /**
     * check if the user is logged in, and if so, load the manager and club into ember data, along with user preferences, etc.
     */
    
    if (this.get('session.isAuthenticated')) {

      this.buildSession(transition);

    } else {

      // Else just let the app load straight away

    }
    
    /**
     * Promise hash
     */
    
    return Ember.RSVP.hash(hash).then((data) => {
      
      return data;
      
    });

  },

});
