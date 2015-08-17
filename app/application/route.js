import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';
import LoadingSliderMixin from '../mixins/loading-slider';

export default Ember.Route.extend(ApplicationRouteMixin, LoadingSliderMixin, {
  
  listenForEvents: function(){
    
    /**
     * May need to remove this.
     * Otherwise users will be logged out a lot, even if it's just a temporary loss of connection.
     */
    this.get('EventBus').subscribe('accessTokenWasNotRefreshed', this,function(){
      this.send('sessionCouldNotBeRefreshed');
    });
    
  }.on('init'),
  
  actions: {
    
    sessionAuthenticationSucceeded: function() {
      
      // Prevent transition after facebook authorize.
      // We still need to authenticate with our own servers.
      if( this.get('session.authenticator')!=='simple-auth-authenticator:torii'){
        var attemptedTrans = this.session.get('attemptedTransition');
        if (attemptedTrans) {
          attemptedTrans.retry();
          this.session.set('attemptedTransition', null);
        } else {
          
          this.transitionTo('dashboard');
          
        }
      }
      
    },
    sessionCouldNotBeRefreshed: function(/*error*/) {
      this.send('invalidateSession');
    },
    
    invalidateSession: function(){
      
      var self = this;
      
      Ember.$("#splash").fadeIn(222,function(){
        //Ember.$(this).hide();
        self.get('session').invalidate().then(function(){
          return false;
        });
      });
      
      
      //this.transitionTo('login');
      return false;
    },
    loginWithFacebook: function(button){
      var self = this;
      this.get('session').authenticate('simple-auth-authenticator:torii', 'facebook-oauth2').then(function(){
        
        var data = {};
        data.redirect_uri = window.location.href;
        data.auth_code = self.get('session.content.secure.authorizationCode');
        
        self.get('session').authenticate('authenticator:facebook', data
        ).then(function(){
          
          // Successful login is handled above
          self.send('sessionAuthenticationSucceeded');
          
        },function(response){
          
          if( response.error === 'facebookEmailNotFound' ){
            
            // Redirect to signup
            // TODO: Signup user up at this point using their email
            self.transitionTo('/signup');
            
          } else {
            
            self.modal.show({
              'type': 'error',
              'title': 'Facebook Login Failed',
              'message': response.message,
              'showAction': true,
            });
            
            button.reset();
            
          }
          
        });
        
      },function(){
        button.reset();
      });
    },
    transitionToRoute: function(route){
      this.transitionTo(route);
    },
  }
});
