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
  
  setup: Ember.on('didInsertElement',function(){
    
    let self = this;
    let $img = this.$('img');
    
    // Add classes to the image itself
    if(this.get('class')){
      $img.addClass(this.get('class'));
      this.$().removeClass(this.get('class'));
    }
    
    if(this.get('url')){
      
      let startTime = Date.now();
      
      // Get image url
      let url = this.get('url');
      
      // Preload image
      Ember.Blackout.preloadImage(url,function() {
        
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
        //},2000);
        
        
      },function(){ // Error
        
        // Hide
        $img.slideUp(function(){
          $img.remove();
        });
        
      });
      
      // Set placeholder height temporarily
      let w = this.$().width();
      let h = w * (9/16);
      this.$().css('height',h+'px');
      
      // If image isn't immediately available
      Ember.run.later(function(){
        if(!self.get('firstImageHasLoaded')){
          self.$().findClosest('.spinner').removeClass('hidden').addClass('animated fadeIn');
        }
      },this.get('imageCachedTime'));
      
    } else {
      
      Ember.warn("Blackout: fade-img component was created without a URL");
      $img.remove();
      
    }
    
    
  }),
  
});
