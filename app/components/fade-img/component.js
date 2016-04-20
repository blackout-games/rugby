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
    
    let $img = this.$('img');
    
    if(this.get('url')){
      
      let startTime = Date.now();
      
      // Get image url
      let url = this.get('url');
      
      // Preload image
      Ember.Blackout.preloadImage(url).then((size)=>{
        let { w, h } = size;
        
        if(this.assertComponentStillExists()){
          
          if(this.assertImageRes(w,h)){
            
            let loadTime = Date.now() - startTime;
          
            if(loadTime <= this.get('imageCachedTime')){
              $img.addClass('fade-img-immediate');
            }
            
            Ember.run.next(()=>{
            //Ember.run.later(function(){ // For simulating a slow image
              
              // Add image url
              // Remove hidden class ("hidden" class is needed initially for firefox to make sure spinner is centered)
              $img.attr('src',url).removeClass('hidden');
              
              // Allow height to be auto
              this.$().css('height','auto');
              
              this.$().findClosest('.spinner').remove();
              
              // Must wait again after we remove hidden class
              // 'run.next' doesn't work and allows image to just appear
              Ember.run.later(function(){ 
                $img.addClass('fade-img-show');
              },111);
              
            });
            //},5000);
          
          }
          
        }
        
      },()=>{ // Error
        
        // Hide
        $img.slideUp();
        
      });
      
      Ember.run.next(()=>{
        // Set placeholder height temporarily
        let w = this.$().width();
        let h = w * (9/16);
        this.$().css('height',h+'px');
      });
      
      // If image isn't immediately available
      Ember.run.later(()=>{
        if(!this.get('firstImageHasLoaded')){
          this.$().findClosest('.spinner').removeClass('hidden').addClass('animated fadeIn');
        }
      },this.get('imageCachedTime'));
      
    } else {
      
      Ember.Logger.warn("fade-img component was created without a URL");
      $img.remove();
      
    }
    
    
  }),
  
  assertImageRes(w,h) {
    
    let minRes = this.get('minResolution');
    
    if(w<minRes && h<minRes) {
      
      // Hide
      this.$().slideUp();
      
      return false;
      
    }
    
    this.$().slideDown();
    
    return true;
    
  },
  
});
