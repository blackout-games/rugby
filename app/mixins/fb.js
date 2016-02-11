import Ember from 'ember';
import config from '../config/environment';
var $ = Ember.$;
import { translationMacro as t } from "ember-i18n";

export default Ember.Mixin.create({
  
  loadFB: Ember.on('activate', function(){
    
    var self = this;
    
    let locale = this.get('locale').getLocale();
    
    $.getScript('//connect.facebook.net/'+locale.fb+'/sdk.js', function(){
      
      let fbInit = {
        appId: '230716417077656',
        xfbml      : true,
        version: 'v2.5',
      };
      
      if(config.environment === 'production'){
        fbInit.channelUrl = '//'+location.hostname+'/channel.html';
      }
      
      FB.init(fbInit);
      
      self.checkFBLoginStatus();
      
    });
    
  }),
  
  loginToFB(button,delay) {
    
    var self = this;
    
    if(typeof(FB)==='undefined'){
      this.delayLogin(button,delay);
      return;
    }
    
    var response = FB.getAuthResponse();
    
    if(typeof(delay)!=='undefined' && typeof(response)==='undefined'){
      this.delayLogin(button,delay);
      return;
    }
    
    if(response){
      
      self.loginToBlackoutWithFB(response,button);
      
    } else {
      
      let locale = this.get('locale').getLocale();
      
      if(window.navigator.standalone||window.browsers.chromeiOS){
        
        // Save a local indicator so that when we come back, we can automatically log the user in.
        this.set('locals.standaloneFacebookDialogue',Date.now());
        
        var permissionUrl = "https://m.facebook.com/v2.5/dialog/oauth?app_id=230716417077656&response_type=token&redirect_uri=" + window.location + "&scope=email&locale=" + locale.fb + "&locale2=" + locale.fb;
        
        window.location = permissionUrl;
        
      } else {
        
        FB.login(function(response) {
          if (response.authResponse) {
            self.loginToBlackoutWithFB(response.authResponse,button);
          } else {
            // User cancelled login or did not fully authorize
            button.reset();
          }
        },{redirect_uri: window.location, scope: 'email' });
        
      }
      
    }
    
  },
  
  delayLogin(button,delay){
    
    if(!this.get('laterId')){
      
      if(typeof(delay)==='undefined'){
        
        delay = 100;
        
      } else {
        
        delay += 100;
        
      }
      
      if(delay<=5000){
        
        // Try again soon
        let laterId = Ember.run.later(()=>{
          this.set('laterId',false);
          this.loginToFB(button,delay);
        },100);
        
        this.set('laterId',laterId);
        
      } else {
        
        this.modal.show({
          'type': 'error',
          'title': t('modals.facebook-login-failed.title'),
          'message': 'Sorry, facebook is not available right now.',
          'showAction': true,
        });
        
        if(button){
          button.reset();
        }
        
      }
      
    }
    
  },
  
  loginToBlackoutWithFB(authResponse, button) {
    
    var self = this;
    
    this.get('session').authenticate('authenticator:facebook', '', authResponse.accessToken
    ).then(function(){
      
      // Successful login is handled above
      
      // Added this so that if user's lastRoute was home page, button would stop loading after logging in
      // Removed after forcing dashboard to load in this case
      if(button){
        //button.reset();
      }
      
    },function(response){
      
      if( response.error === 'facebookEmailNotFound' ){
        
        // Redirect to signup
        // TODO: Signup user up at this point using their email
        self.transitionTo('/signup');
        
      } else {
        
        self.modal.show({
          'type': 'error',
          'title': t('modals.facebook-login-failed.title'),
          'message': response.message,
          'showAction': true,
        });
        
        if(button){
          button.reset();
        }
        
      }
      
    });
    
  },
  
  checkFBLoginStatus() {
    
    var self = this;
    
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token 
        // and signed request each expire
        //log('user is logged into facebook and BR facebook app');
        var loginAttempt = self.get('locals.standaloneFacebookDialogue');
        
        if( loginAttempt ){
          if(loginAttempt>=Date.now()-120*1000){
            self.loginToBlackoutWithFB(response.authResponse);
          }
        }
        
      } else if (response.status === 'not_authorized') {
        //log('the user is logged in to Facebook but has not authenticated your app');
      } else {
        //log('the user isn\'t logged in to Facebook.');
      }
    });
  }
  
});

