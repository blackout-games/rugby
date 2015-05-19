import Ember from 'ember';
import AfterRender from '../mixins/after-render';
import Timers from '../mixins/timers';
import config from '../config/environment';

export default Ember.View.extend(AfterRender, Timers, {
  
  bgCursor: 0,
  backgrounds: ['01','02','03','04','05'],
  //backgrounds: ['03'],
  backgroundsThatCanStart: ['01','02','03'],
  backgroundsStore: [],
  backgroundPaths: [],
  backgroundDuration: 15000,
  
  afterRender: function() {
    if(!$('#top-section').length) return;
    this.setup();
  },
  
  setSizes: function(){
    var viewHeight = $(window).height();
    $('#top-section').css('min-height',viewHeight);
  },
  
  setup: function(){
    
    this.setSizes();
    $(window).on('resize',this.setSizes);
    this.initBackgroundImages();
    
  },
  
  initBackgroundImages: function() {
    
    this.set('bgCursor',0);
    let canStart = false;
    do {
      this.backgrounds = Em.Blackout.shuffle(this.backgrounds);
      canStart = this.backgroundsThatCanStart.indexOf(this.backgrounds[0]) >= 0;
    } while(!canStart);
    
    $('#top-section').addClass( "bgwhite" );
    
    this.updateBackgroundImage();
    
  },
  
  updateBackgroundImage: function(){
    
    var backgrounds = this.get('backgrounds');
    var self = this;
    
    // Get image path
    if( ! this.backgroundPaths[self.bgCursor] ){
      
      // Must use DOM insertion to get fingerprinted file path
      let url = Em.Blackout.getCSSValue('background-image','bg' + backgrounds[self.bgCursor]);
      this.backgroundPaths[self.bgCursor] = url.substr(4,url.length-5);
      
    }
    var path = this.backgroundPaths[self.bgCursor];
    
    // Preload image first
    var img = $('<img src="'+path+'" />');
    img.load(function() {
        
        // Remove old class
        $("#top-section").removeClass (function (index, css) {
          return (css.match (/(^|\s)bg\S+/g) || []).join(' ');
        });
        
        // Add new class
        $('#top-section').addClass( "bg" + backgrounds[self.bgCursor] );
        
        // Increment cursor
        if( self.bgCursor == backgrounds.length-1 ){
          self.set('bgCursor',0);
        } else {
          self.incrementProperty('bgCursor');
        }
        
        // Schedule next update
        self.addTimer(function(){
          self.updateBackgroundImage();
        },self.backgroundDuration,true);

    });
    
    if( this.backgroundsStore.length < backgrounds.length ){
      this.backgroundsStore.push(img);
    }
    
  },
  
});
