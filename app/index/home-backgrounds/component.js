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
  backgroundDuration: 3000,
  topLayerIsShowing: false,
  
  setup: function(){
    this.setSizes();
    $(window).on('resize', Ember.run.bind(this, this.setSizes));
    this.initBackgroundImages();
  }.on('didInsertElement'),
  
  clean: function(){
    
    $(window).off('resize', Ember.run.bind(this, this.setSizes));
    this.cancelTimers();
    
  }.on('willDestroyElement'),
  
  setSizes: function(){
    var viewHeight = $(window).height();
    Ember.$('#top-section').css('min-height',viewHeight);
  },
  
  initBackgroundImages: function() {
    
    this.set('bgCursor',0);
    let canStart = false;
    do {
      this.backgrounds = B.shuffle(this.backgrounds);
      canStart = this.backgroundsThatCanStart.indexOf(this.backgrounds[0]) >= 0;
    } while(!canStart);
    
    this.$('#top-section').addClass( "bgstart" );
    
    this.updateBackgroundImage();
    
  },
  
  updateBackgroundImage: function(){
    
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
