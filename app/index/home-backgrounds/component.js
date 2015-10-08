import Ember from 'ember';
import Timers from '../../mixins/timers';
var  E = Ember;
var B = E.Blackout;
var  $ = E.$;

export default Ember.Component.extend(Timers, {
  classNames: [],
  
  bgCursor: 0,
  backgrounds: ['01','02','03','04','05','06'],
  //backgrounds: ['03'],
  backgroundsThatCanStart: ['01','02','03'],
  backgroundPaths: [],
  backgroundDuration: 15000,
  topLayerIsShowing: false,

  scrollable: Ember.computed('window.features.lockBody', function() {
    if(window.features.lockBody){
      return Ember.$('#nav-body');
    } else {
      return Ember.$(window);
    }
  }),
  
  setup: Ember.on('didInsertElement', function(){
    this.setSizes();
    
    this.setSizesBound = Ember.run.bind(this,this.setSizes);
    $(window).on('resize', this.setSizesBound);
    
    this.initBackgroundImages();
    
    // For parallax
    if(window.features.canParallax){
      
      Ember.$('#top-section-wrapper').css('height',$(window).height());
      this.inflateBalloonBound = Ember.run.bind(this,this.inflateBalloon);
      this.get('scrollable').on('scroll',this.inflateBalloonBound);
      $(window).on('resize', this.inflateBalloonBound);
      
    }
    
    
  }),
  
  clean: Ember.on('willDestroyElement', function(){
    
    if(this.setSizesBound){
      $(window).off('resize', this.setSizesBound);
    }
    
    if(this.inflateBalloonBound){
      $(window).off('resize', this.inflateBalloonBound);
      this.get('scrollable').off('scroll', this.inflateBalloonBound);
    }
    
    this.cancelTimers();
    
  }),
  
  inflateBalloon() {
  	// Inflate balloon as we scroll
  	Ember.$('#top-section-balloon').css('height',this.get('scrollable').scrollTop()*0.4);
  },
  
  setSizes() {
    
    Ember.$('#top-section').css('height',$(window).height());
    Ember.$('#top-section-wrapper').css('height',$(window).height());
    
    var testimonyBottom = Ember.$('#testimony').offset().top + Ember.$('#testimony').height();
    
    var welcomeTop = Ember.$('#welcome').offset().top;
    var contentHeight = testimonyBottom - welcomeTop;
    
    
    var menuHeight = parseInt(Ember.$('#nav-body').css('padding-top'));
    
    // Allow for bottom buttons on mobile
    if(this.get('media.isMobile')){
      menuHeight += 55;
    }
    var topMargin = ($(window).height() - contentHeight - menuHeight) * 0.5;
    
    Ember.$('#welcome').css('margin-top',topMargin+'px');
    
  },
  
  initBackgroundImages() {
    
    this.set('bgCursor',0);
    let canStart = false;
    do {
      this.backgrounds = B.shuffle(this.backgrounds);
      canStart = this.backgroundsThatCanStart.indexOf(this.backgrounds[0]) >= 0;
    } while(!canStart);
    
    this.$('#top-section').addClass( "bgstart" );
    
    this.updateBackgroundImage();
    
  },
  
  updateBackgroundImage() {
    
    var backgrounds = this.get('backgrounds');
    var self = this;
    
    // Get image path
    if( ! this.backgroundPaths[self.bgCursor] ){
      
      // Must use DOM insertion to get fingerprinted file path
      let url = B.getCSSValue('background-image','bg' + backgrounds[self.bgCursor]);
      this.backgroundPaths[self.bgCursor] = B.trimChar( url.substr(4,url.length-5), '"');
      
    }
    var path = this.backgroundPaths[self.bgCursor];
    
    // Start with bottom visible
    Ember.$('#top-section').addClass( "hide-top" );
    
    B.preloadImage(path,function() {
        
        if( self.get('topLayerIsShowing') ){
        
          // Remove old class from bottom layer
          Ember.$('#top-section').removeClass (function (index, css) {
            return (css.match (/(^|\s)bg-bottom\S+/g) || []).join(' ');
          });
          
          // Place new image on bottom layer
          Ember.$('#top-section').addClass( "bg-bottom" + backgrounds[self.bgCursor] );
          
          // Hide top layer
          Ember.$('#top-section').removeClass( "show-top" );
          Ember.$('#top-section').addClass( "hide-top" );
          
          // Track
          self.set('topLayerIsShowing',false);
          
        } else { // top layer is hidden
        
          // Remove old class from top layer
          Ember.$('#top-section').removeClass (function (index, css) {
            return (css.match (/(^|\s)bg-top\S+/g) || []).join(' ');
          });
          
          // Place new image on top layer
          Ember.$('#top-section').addClass( "bg-top" + backgrounds[self.bgCursor] );
          
          // Show top layer
          Ember.$('#top-section').addClass( "show-top" );
          Ember.$('#top-section').removeClass( "hide-top" );
          
          // Track
          self.set('topLayerIsShowing',true);
          
        }
        
        // Increment cursor
        if( self.bgCursor === backgrounds.length-1 ){
          self.set('bgCursor',0);
        } else {
          self.incrementProperty('bgCursor');
        }
        
        // Schedule next update
        self.addTimer(function(){
          self.updateBackgroundImage();
        },self.backgroundDuration,true);

    });
   
  },
});
