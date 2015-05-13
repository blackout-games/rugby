import Ember from 'ember';
import AfterRender from '../mixins/after-render';

export default Ember.View.extend(AfterRender, {
  
  bgCursor: 0,
  backgrounds: ['01','02','03','04','05'],
  backgroundsStore: [],
  backgroundDuration: 5000,
  
  afterRender: function() {
    if(!$('#top-section').length) return;
    this.setup();
  },
  
  setup: function(){
    
    var viewHeight = $(window).height();
    $('#top-section').height(viewHeight);
    
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
    
    // Preload image first
    var img = $('<img src="../../assets/images/backgrounds/home/' + backgrounds[this.bgCursor] + '.jpg" />');
    
    
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
