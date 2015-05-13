import Ember from 'ember';
import AfterRender from '../mixins/after-render';
import config from '../config/environment';

export default Ember.View.extend(AfterRender, {
  
  bgCursor: 0,
  backgrounds: ['01','02','03','04','05'],
  backgroundsStore: [],
  backgroundPaths: [],
  backgroundDuration: 3000,
  
  afterRender: function() {
    if(!$('#top-section').length) return;
    this.setup();
  },
  
  setSizes: function(){
    var viewHeight = $(window).height();
    $('#top-section').height(viewHeight);
  },
  
  setup: function(){
    
    this.setSizes();
    $(window).on('resize',this.setSizes);
    this.initBackgroundImages();
    
  },
  
  initBackgroundImages: function() {
    
    this.set('bgCursor',0);
    this.backgrounds = Em.Blackout.shuffle(this.backgrounds);
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
        Ember.run.later(self,self.updateBackgroundImage,self.backgroundDuration);

    });
    
    if( this.backgroundsStore.length < backgrounds.length ){
      this.backgroundsStore.push(img);
    }
    
  },
  
});
