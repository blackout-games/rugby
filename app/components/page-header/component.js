import Ember from 'ember';
var $ = Ember.$;

var images = {
  "dashboard": 8,
  "news": 6,
  "rugby": 5,
};

/**
 * Attributes:
 * 
 * images: image list to choose from
 * route: the route name to use to remember the image picked (allows multiple routes to use the same images list, but not have the same image)
 * 
 */

export default Ember.Component.extend({
  classNames: ['page-header','clearfix'],
  
  pickOne: Ember.on('didInsertElement', function(){
    
    if( this.get('images') ){
      
      var key = this.get('images');
      
      if( images[key] ){
        
        var session = this.get('session');
        
        var route = this.get('route');
        if(!route){
          route = key;
        }
        
        // Check if we've been here
        var sessionKey = route+'-header-image';
        var imageClass = session.get(sessionKey);
        
        if(!imageClass){
          var available = images[this.get('images')];
          var image = Ember.Blackout.rand(1,available);
          imageClass = key + '-' + image;
          session.set(sessionKey,imageClass);
        }
        
        this.$().addClass(imageClass);
        
      }
      
    }
    
    this.updateLoadingSlider();
    
  }),
  
  
  /*uiEvents: [
    {
      eventName: 'scroll',
      callbackName: 'updateLoadingSlider',
      selector: window,
    }
  ],*/
  updateLoadingSlider(e) {
    
    // Too hard to get right while scrolling, especially since chrome iOS doesn't report scrolling events instantly
    
    /*
    var $slider = $('.loading-slider');
    var isScroll = e && e.type && e.type==='scroll';
    
    var eTop = this.$('#under-header').offset().top; //get the offset top of the element
    var sliderLocation = eTop - $(window).scrollTop();
    
    if(isScroll){
      if(!$slider.data('menuOpen')){
        $slider.css('top',sliderLocation);
      }
    } else {
      Ember.run.later(function(){
        if(!$slider.data('menuOpen')){
          $slider.css('top',sliderLocation);
        }
      },400);
    }
    $slider.data('normalLocation',sliderLocation);
    */
   
  },
  
  resetLoadingSlider: Ember.on('willDestroyElement', function(){
    
    /*
    var $slider = $('.loading-slider');
    
    if(!$slider.data('menuOpen')){
      $slider.css('top','0px');
    }
    $slider.data('normalLocation','0px');
    */
    
  }),
  
});
