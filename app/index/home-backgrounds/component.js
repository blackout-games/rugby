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
    
    //let overScroll = this.get('topSectionHeight') - $(window).height();
    
    // For parallax
    /*if(window.features.canParallax && overScroll<=5){
      
      //Ember.$('#top-section-wrapper').css('height',this.get('topSectionHeight'));
      this.inflateBalloonBound = Ember.run.bind(this,this.inflateBalloon);
      this.get('scrollable').on('scroll',this.inflateBalloonBound);
      $(window).on('resize', this.inflateBalloonBound);
      
    }*/
    
    
  }),
  
  clean: Ember.on('willDestroyElement', function(){
    
    if(this.setSizesBound){
      $(window).off('resize', this.setSizesBound);
    }
    
    /*if(this.inflateBalloonBound){
      $(window).off('resize', this.inflateBalloonBound);
      this.get('scrollable').off('scroll', this.inflateBalloonBound);
    }*/
    
    this.cancelTimers();
    
  }),
  
  /*inflateBalloon() {
  	// Inflate balloon as we scroll
  	Ember.$('#top-section-balloon').css('height',this.get('scrollable').scrollTop()*0.4);
  },*/
  
  setSizes() {
    
    let bottomObject = '#testimony';
    //let bottomObject = '#subtitle';
    //let bottomObject = '.signup-container';
    
    var bottom = Ember.$(bottomObject).offset().top + Ember.$('#testimony').height();
    
    var welcomeTop = Ember.$('#welcome').offset().top;
    var contentHeight = bottom - welcomeTop;
    
    var topSectionHeight = Math.max((contentHeight + 100), $(window).innerHeight());
    this.set('topSectionHeight',topSectionHeight);
    
    // Max with enough room for bottom buttons
    let limitedTopSectionHeight = Math.min(topSectionHeight, $(window).innerHeight() - 77);
    
    Ember.$('#top-section').css('height',limitedTopSectionHeight);
    
    Ember.$('#top-section-wrapper').css({
      'height': $(window).innerHeight()+'px'
    });
    
    var menuHeight = parseInt(Ember.$('#nav-body').css('padding-top'));
    
    // Allow for bottom buttons on mobile
    if(this.get('media.isMobile')){
      menuHeight += 55;
    }
    var topMargin = (topSectionHeight - contentHeight - menuHeight) * 0.5;
    
    Ember.$('#welcome').css('margin-top',topMargin+'px');
    
  },
  
  initBackgroundImages() {
    
    this.set('bgCursor',0);
    let canStart = false;
    do {
      this.backgrounds = B.shuffle(this.backgrounds);
      canStart = this.backgroundsThatCanStart.indexOf(this.backgrounds[0]) >= 0;
    } while(!canStart);
    
    this.$().addClass( "bgstart" );
    
    this.updateBackgroundImage();
    
  },
  
  updateBackgroundImage() {
    
    var backgrounds = this.get('backgrounds');
    
    // Get image path
    if( ! this.backgroundPaths[this.bgCursor] ){
      
      // Must use DOM insertion to get fingerprinted file path
      let url = B.getCSSValue('background-image','bg' + backgrounds[this.bgCursor]);
      this.backgroundPaths[this.bgCursor] = B.trimChar( url.substr(4,url.length-5), '"');
      
    }
    var path = this.backgroundPaths[this.bgCursor];
    
    // Start with bottom visible
    this.$().addClass( "hide-top" );
    
    B.preloadImage(path).then(()=>{
      
      if(this.assertComponentStillExists()){
        
        if( this.get('topLayerIsShowing') ){
        
          // Remove old class from bottom layer
          this.$().removeClass (function (index, css) {
            return (css.match (/(^|\s)bg-bottom\S+/g) || []).join(' ');
          });
          
          // Place new image on bottom layer
          this.$().addClass( "bg-bottom" + backgrounds[this.bgCursor] );
          
          // Hide top layer
          this.$().removeClass( "show-top" );
          this.$().addClass( "hide-top" );
          
          // Track
          this.set('topLayerIsShowing',false);
          
        } else { // top layer is hidden
        
          // Remove old class from top layer
          this.$().removeClass (function (index, css) {
            return (css.match (/(^|\s)bg-top\S+/g) || []).join(' ');
          });
          
          // Place new image on top layer
          this.$().addClass( "bg-top" + backgrounds[this.bgCursor] );
          
          // Show top layer
          this.$().addClass( "show-top" );
          this.$().removeClass( "hide-top" );
          
          // Track
          this.set('topLayerIsShowing',true);
          
        }
        
        // Increment cursor
        if( this.bgCursor === backgrounds.length-1 ){
          this.set('bgCursor',0);
        } else {
          this.incrementProperty('bgCursor');
        }
        
        // Schedule next update
        this.addTimer(()=>{
          this.updateBackgroundImage();
        },this.backgroundDuration,true);
        
      }

    });
   
  },
});
