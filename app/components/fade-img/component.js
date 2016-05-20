import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * The image URL or src
   * @type {String}
   */
  url: '',
  
  /**
   * Set this to create an image placeholder if the main image is not provided
   * @type {url}
   */
  placeholderUrl: null,
  
  /**
   * Set this to disallow the loader animation while image is loading
   */
  loaderAnimation: true,
  
  /**
   * Set this to hide the image (slideUp) if the image fails to load
   */
  hideOnFailure: false,
  
  /**
   * Testing
   */
  
  testDelayLoad: false, //2000,
  testDelayFade: false, //2000,
  
  /**
   * Internals
   */
  
  classNames: ['fade-img-default-bg'],
  classNameBindings: ['imageClassNames','cover:cover','isShowingLoader:center-parent'],
  tagName: 'div',
  imageCachedTime: 100, // Milliseconds in whcih an image loads to be considered available immediately
  minResolution: 700, // At least one dimension of the image must be 700px to be displayed
  isLoadingImage: false,
  
  isShowingLoader: Ember.computed.and('isLoadingImage','loaderAnimation'),
  
  setup: Ember.on('didInsertElement',function(){
    Ember.run.scheduleOnce('afterRender', this, ()=>{
      this.updateImage();
    });
  }),
  
  imageClassNames: Ember.computed('imageClasses', function(){
    return this.get('imageClasses') ? this.get('imageClasses').join(' ') : '';
  }),
  
  onUpdate: Ember.on('didUpdateAttrs',function(attrs){
    if(this.attrChanged(attrs,'url')){
      this.updateImage();
    }
  }),
  
  updateImage(){
    
    let $img = this.$('.fade-img');
    let startTime = Date.now();
    
    this.$().css('height','');
    let heightAlreadySet = this.$().css('height')!=='0px';
    
    if(this.get('bgColor')){
      this.$().css('background-color',this.get('bgColor'));
    } else {
      this.$().css('background-color','');
    }
    
    // Get image url
    let url = this.get('url');
    
    if(this.get('prevUrl') !== url){
      this.resetImage();
    }
    
    this.set('prevUrl',url);
    
    this.setupPlaceholder();
    
    if(url){
      
      if(!this.get('firstImageHasLoaded')){
        this.startLoadingImage();
      }
      
      // Get secure url
      url = Ember.Blackout.secureURLIfHttps(url);
      
      // Preload image
      Ember.Blackout.preloadImage(url).then((size)=>{
        let { w, h } = size;
        
        if(this.assertComponentStillExists()){
          
          if(this.assertImageRes(w,h)){
            
            let loadTime = Date.now() - startTime;
          
            if(loadTime <= this.get('imageCachedTime') && !this.get('testDelayLoad') && !this.get('testDelayFade')){
              $img.addClass('fade-img-immediate');
            }
            
            Ember.run.later(()=>{
            //Ember.run.later(function(){ // For simulating a slow image
              
              // Add image url
              if(this.get('cover')){
                $img.css({
                  'background-image': 'url('+url+')',
                  width: this.$().width() + 'px',
                  height: this.$().height() + 'px',
                });
              } else {
                $img.attr('src',url);
              }
              
              // Remove hidden class ("hidden" class is needed initially for firefox to make sure spinner is centered)
              this.stopLoadingImage();
              
              if(!heightAlreadySet){
                // Allow height to be auto
                this.$().css('height','auto');
              }
              
              // Must wait again after we remove hidden class
              // 'run.next' doesn't work and allows image to just appear
              Ember.run.later(()=>{ 
                $img.addClass('fade-img-show');
                
              },(this.get('testDelayFade') ? this.get('testDelayFade') : 111));
              
            },(this.get('testDelayLoad') ? this.get('testDelayLoad') : 1));
          
          }
          
        }
        
      },()=>{ // Error
        
        if(this.get('hideOnFailure')){
          $img.slideUp();
        } else {
          this.setupImageNotFound();
        }
        
      });
      
      // If there is no specified height on the class
      if(!heightAlreadySet){
        Ember.run.next(()=>{
          // Set placeholder height temporarily
          let w = this.$().width();
          let h = w * (9/16);
          this.$().css('height',h+'px');
        });
      }
      
    }
    
  },
  
  setupPlaceholder(){
    
    let $img = this.$('.fade-img-placeholder');
    
    // Only show if main image is empty
    if(this.get('placeholderUrl') && !this.get('url')){
      
      let url = this.get('placeholderUrl');
      url = Ember.Blackout.secureURLIfHttps(url);
      
      if(this.get('cover')){
        $img.css({
          'background-image': 'url('+url+')',
        });
      } else {
        $img.attr('src',url);
      }
      
    } else {
      
      if(this.get('cover')){
        $img.css({
          'background-image': 'none',
        });
      } else {
        $img.attr('src','');
      }
      
    }
    
  },
  
  setupImageNotFound(){
    
    let $img = this.$('.fade-img-not-found');
    
    // Only show if main image is empty
    if(this.get('notFoundUrl')){
      
      let url = this.get('notFoundUrl');
      url = Ember.Blackout.secureURLIfHttps(url);
      
      if(this.get('cover')){
        $img.css({
          'background-image': 'url('+url+')',
        });
      } else {
        $img.attr('src',url);
      }
      
    } else {
      
      if(this.get('cover')){
        $img.css({
          'background-image': 'none',
        });
      } else {
        $img.attr('src','');
      }
      
    }
    
  },
  
  startLoadingImage(){
    this.set('isLoadingImage',true);
  },
  
  stopLoadingImage(){
    this.set('isLoadingImage',false);
  },
  
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
  
  resetImage(){
    
    let $img;
    
    // Primary image
    $img = this.$('.fade-img');
    if(this.get('cover')){
      $img.css('background-image','');
    } else {
      $img.attr('src','');
    }
    
    // Placeholder
    $img = this.$('.fade-img-placeholder');
    if(this.get('cover')){
      $img.css('background-image','');
    } else {
      $img.attr('src','');
    }
    
    // Not found
    $img = this.$('.fade-img-not-found');
    if(this.get('cover')){
      $img.css('background-image','');
    } else {
      $img.attr('src','');
    }
    
  },
  
});
