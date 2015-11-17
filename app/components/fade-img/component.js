import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * The image URL or src
   * @type {String}
   */
  url: '',
  
  /**
   * Internals
   */
  
  classNames: ['fade-img-placeholder center-parent'],
  tagName: 'div',
  imageCachedTime: 100, // Milliseconds in whcih an image loads to be considered available immediately
  minResolution: 700, // At least one dimension of the image must be 700px to be displayed
  
  setup: Ember.on('didInsertElement',function(){
    
    let self = this;
    let $img = this.$('img');
    
    if(this.get('url')){
      
      let startTime = Date.now();
      
      // Get image url
      let url = this.get('url');
      
      // Preload image
      Ember.Blackout.preloadImage(url,function(w,h) {
        
        if(self.assertImageRes(w,h)){
          
          let loadTime = Date.now() - startTime;
        
          if(loadTime <= self.get('imageCachedTime')){
            $img.addClass('fade-img-immediate');
          }
          
          Ember.run.next(function(){
          //Ember.run.later(function(){ // For simulating a slow image
            
            // Add image url
            $img.attr('src',url);
            
            // Allow height to be auto
            self.$().css('height','auto');
            
            self.$().findClosest('.spinner').remove();
            
            $img.addClass('fade-img-show');
            
          });
          //},5000);
        
        }
        
      },function(){ // Error
        
        // Hide
        $img.slideUp();
        
      });
      
      Ember.run.next(function(){
        // Set placeholder height temporarily
        let w = self.$().width();
        let h = w * (9/16);
        self.$().css('height',h+'px');
      });
      
      // If image isn't immediately available
      Ember.run.later(function(){
        if(!self.get('firstImageHasLoaded')){
          self.$().findClosest('.spinner').removeClass('hidden').addClass('animated fadeIn');
        }
      },this.get('imageCachedTime'));
      
    } else {
      
      Ember.warn("fade-img component was created without a URL",false,{id:'blackout.fade-img-component-missing-url'});
      $img.remove();
      
    }
    
    
  }),
  
  assertImageRes(w,h) {
    
    let minRes = this.get('minResolution');
    let self = this;
    
    if(w<minRes && h<minRes) {
      
      // Hide
      self.$().slideUp();
      
      return false;
      
    }
    
    self.$().slideDown();
    
    return true;
    
  },
  
});
