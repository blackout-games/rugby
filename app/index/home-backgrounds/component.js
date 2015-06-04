import Ember from 'ember';
import Timers from '../../mixins/timers';
var  E = Ember;
var B = E.Blackout;
var  $ = E.$;

export default Ember.Component.extend(Timers, {
  classNames: ['top-section'],
  
  bgCursor: 0,
  backgrounds: ['01','02','03','04','05'],
  //backgrounds: ['03'],
  backgroundsThatCanStart: ['01','02','03'],
  backgroundPaths: [],
  backgroundDuration: 15000,
  
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
    this.$().css('min-height',viewHeight);
  },
  
  initBackgroundImages: function() {
    
    this.set('bgCursor',0);
    let canStart = false;
    do {
      this.backgrounds = B.shuffle(this.backgrounds);
      canStart = this.backgroundsThatCanStart.indexOf(this.backgrounds[0]) >= 0;
    } while(!canStart);
    
    this.$().addClass( "bgwhite" );
    
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
    
    print('started loading');
    
    Ember.Blackout.preloadImages([path],function(){
      
      // All descendant images have loaded, now slide up.
      print('image has loaded',"bg" + backgrounds[self.bgCursor]);
      
      // Remove old class
      self.$().removeClass (function (index, css) {
        return (css.match (/(^|\s)bg\S+/g) || []).join(' ');
      });
      
      // Add new class
      self.$().addClass( "bg" + backgrounds[self.bgCursor] );
      
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
