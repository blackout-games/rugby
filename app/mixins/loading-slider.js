import Ember from 'ember';

export default Ember.Mixin.create({
  
  // Piggy back on loading slider code to check routes loading on boot and decide when to hide the splash screen
  splashShowing: true,
  routesLoading: 0,
  
  actions: {
    loading: function() {
      var controller = this.controllerFor('application');
      controller.set('loading', true);
      this.incrementProperty('routesLoading');
      if( this.router ){
        this.router.one('didTransition', () => {
          this.splashRouteFinished();
          controller.set('loading', false);
        }); 
      }
    },
    finished: function() {
      this.splashRouteFinished();
      this.controllerFor('application').set('loading', false);
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
