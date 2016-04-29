import Ember from 'ember';

export default Ember.Mixin.create({
  
  // Piggy back on loading slider code to check routes loading on boot and decide when to hide the splash screen
  splashShowing: true,
  routesLoading: 0,
  
  actions: {
    loading: function() {
      Ember.Blackout.startLoading();
      this.incrementProperty('routesLoading');
      if( this.router ){
        this.router.one('didTransition', () => {
          this.splashRouteFinished();
          Ember.Blackout.stopLoading();
        }); 
      }
      return true; // Bubble event
    },
    finished: function() {
      this.splashRouteFinished();
      Ember.Blackout.stopLoading();
    }
  },
  
  startCheckingSplash: Ember.on('activate', function(){
    Ember.run.debounce(this,this.hideSplash,333);
  }),
  
  splashRouteFinished(){
    this.decrementProperty('routesLoading');
    Ember.run.debounce(this,this.hideSplash,111);
  },
  
  hideSplash(){
    
    // Allow scroll bar on body again
    Ember.$('body').removeClass('hide-scrollbar');
    
    if(this.get('routesLoading')===0){
      
      if(this.get('media.isMobile') || this.get('media.isTablet')){
        Ember.$('#splash').addClass('animated bounceOutLeft');
      } else {
        //Ember.$('#splash').addClass('animated bounceOutUp');
        Ember.$('#splash').addClass('animated fadeOut');
      }
      
      Ember.$('#splash').on(Ember.Blackout.afterCSSAnimation, function(){
        Ember.$('#splash').off( Ember.Blackout.afterCSSAnimation );
        Ember.$('#splash').hide();
      });
    } else {
      Ember.run.debounce(this,this.hideSplash,111);
    }
    
  },
  
});
