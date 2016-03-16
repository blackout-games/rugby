import Ember from 'ember';
const { Blackout } = Ember;

export default Ember.Component.extend({
  
  /**
   * Public Attributes
   */
  
  /**
   * CSS color to use as the underlying color before the image loads and fades in
   * @type {CSS Color}
   */
  defaultColor: '',
  
  /**
   * If using an image URL, set imageUrl
   * @type {String}
   */
  imageUrl: '',
  
  /**
   * If using a class with an image already included in the :before pseudo element
   * @type {Space separated classes}
   */
  imageClass: '',
  
  /**
   * To set a placeholder image class set placeholderClass
   * @type {Space separated classes}
   */
  placeholderClass: '',
  
  /**
   * To add classes to be applied to the actual image bearing div set this
   * @type {Space separated classes}
   */
  bgClass: '',
  
  /**
   * The loader animation shows in the center until the image is ready
   * @type {Boolean}
   */
  showLoader: false,
  
  /**
   * Set this to true if you want the current image to fade out immediately when a new image is given. Default is to keep the previous image visible until the new image downloads.
   * @type {Boolean}
   */
  fadeOutImmediately: false,
  
  
  /**
   * 
   * Other notes:
   * 
   * If using a tint, the fade image is expected in the :before element (normally so we can tint in :after).
   * 
   * If using an image placeholder, the real image must be specified in the :after pseudo element of the provided image class (placeholder image in :before).
   * 
   */
  
  // Internal
  classNames: ['fade-bg-default'],
  lastImageClass: '',
  firstImageHasLoaded: false,
  thereIsACurrentImage: false,
  imageCachedTime: 100, // Milliseconds in whcih an image loads to be considered available immediately
  minResolution: 700, // At least one dimension of the image must be 700px to be displayed
  
  bindFunctions: Ember.on('init',function(){
    this.afterFadeoutBound = Ember.run.bind(this,this.afterFadeout);
    this.fadeInImageBound = Ember.run.bind(this,this.fadeInImage);
  }),
  
  addLoader: Ember.on('didInsertElement',function(){
    
    if(this.get('showLoader')){
      Ember.run.later(()=>{
        if(!this.get('firstImageHasLoaded')){
          this.$().findClosest('.spinner').removeClass('hidden').addClass('animated fadeIn');
        }
      },this.get('imageCachedTime'));
    }
    
  }),
  
  setup(){
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    
    this.set('imageIsImmediatelyFadingOut',false);
    
    // Add any extra classes
    if(this.get('bgClass')){
      $fadeBg.addClass(this.get('bgClass'));
    }
    
    if(this.get('placeholderClass')){
      
      // Set placeholder
      this.$().addClass(this.get('placeholderClass'));
      
    } else if(this.get('defaultColor')) {
      
      // Set default background color
      this.$().css('background-color',this.get('defaultColor'));
    
    }
    
    if(this.get('imageClass')){
      
      // Get image url
      let url = Ember.Blackout.getCSSPseudoValue('background-image',this.get('imageClass'),':before').replace(/url\(/,'').rtrim(')');
      
      let startTime = Date.now();
      
      if(this.get('fadeOutImmediately') && this.get('thereIsACurrentImage')){
        this.set('imageIsImmediatelyFadingOut',true);
        this.fadeOutImage( $fadeBg, this.fadeInImageBound );
        
      }
      
      // Load image
      Ember.Blackout.preloadImage(url).then((w,h)=>{
        
        if(this.assertComponentStillExists()){
          
          if(this.assertImageRes(w,h)){
            
            if(!this.get('imageIsImmediatelyFadingOut')){
              
              if(this.get('thereIsACurrentImage') && !this.get('fadeOutImmediately')){
                  
                this.fadeOutImage( $fadeBg, this.fadeInImageBound );
              
              } else {
                
                let loadTime = Date.now() - startTime;
                this.fadeInImage( null, $fadeBg, loadTime <= this.get('imageCachedTime') );
                
              }
              
            } else {
              
              this.set('imageIsImmediatelyFadingOut',false);
            }
            
          }
          
        }
        
      });
      
    } else if(this.get('imageUrl')){
      
      // Get image url
      let url = this.get('imageUrl');
      
      let startTime = Date.now();
      
      if(this.get('fadeOutImmediately') && this.get('thereIsACurrentImage')){
        this.set('imageIsImmediatelyFadingOut',true);
        this.fadeOutImage( $fadeBg, this.fadeInImageBound );
      }
      
      // Load image
      Ember.Blackout.preloadImage(url).then((w,h)=>{
        
        if(this.assertComponentStillExists()){
          
          if(this.assertImageRes(w,h)){
            
            if(!this.get('imageIsImmediatelyFadingOut')){
              
              if(this.get('thereIsACurrentImage') && !this.get('fadeOutImmediately')){
                  
                this.fadeOutImage( $fadeBg, this.fadeInImageBound );
              
              } else {
                
                let loadTime = Date.now() - startTime;
                this.fadeInImage( null, $fadeBg, loadTime <= this.get('imageCachedTime') );
                
              }
              
            } else {
              this.set('imageIsImmediatelyFadingOut',false);
            }
            
          }
          
        }
        
      },()=>{ // Error
        
        // Hide
        $fadeBg.slideUp();
        
      });
      
    }
    
  },
  
  fadeOutImage($fadeBg,callback=null) {
    
    Ember.run.next(()=>{
      
      $fadeBg.addClass('fade-bg-out').removeClass('fade-bg-show fade-bg-immediate');
      
      
      $fadeBg.one(Ember.Blackout.afterCSSTransition, $fadeBg, callback);
      
      // Track state (MUST happen here, otherwise things can get messy, leaving imageIsImmediatelyFadingOut to always be set to true, and fadeouts being attempted even when there is no current image)
      this.set('thereIsACurrentImage',false);
      
    });
    //},1000);
    
  },
  
  fadeInImage(e,$fadeBg=null,showImmediately=false) {
    
    if(e){
      $fadeBg = e.data;
    }
    
    // Ensure jquery event callback runs only once
    if(!e || !this.get('animationEndType') || this.get('animationEndType')===e.type){
      
      if(e){
        this.set('animationEndType',e.type);
      }
      
    } else {
      return;
    }
    
    
    if(this.get('imageIsImmediatelyFadingOut')){
      this.set('imageIsImmediatelyFadingOut',false);
      return;
    }
    
    
    // The background may not have been completely faded out from last fade-out when we reset, so it may seem like a quick fade-in from here. But I think that works well i.e. fast transition = fast fades (Jeremy)
    this.resetFade();
    
    if(this.get('imageClass')){
      
      $fadeBg.addClass(this.get('imageClass') + ' fade-bg-ready');
      this.set('lastImageClass',this.get('imageClass'));
      
    } else if(this.get('imageUrl')){
      
      // Get image url
      let url = this.get('imageUrl');
      
      // Get a unique className
      let className = 'fade-bg-' + url.hashCode();
      
      // Create a fresh css pseudo rule
      Ember.Blackout.addCSSRule( '.' + className + ':before', 'background-image: url('+url+') !important;');
      
      $fadeBg.addClass('fade-bg-ready ' + className);
      this.set('lastImageUrl',url);
      
    }
  
    if(showImmediately){
      $fadeBg.addClass('fade-bg-immediate');
    }
    
    Ember.run.later(()=>{ // Use later to ensure no image flashing on safari
      
      if(!this.get('isDestroyed') && !this.get('isDestroying')){
        this.set('firstImageHasLoaded',true);
        this.set('thereIsACurrentImage',true);
        
        if(this.get('showLoader')){
          this.$().findClosest('.spinner').remove();
        }
        
        // Must wait again or else firefox doesn't fade
        // Can't use run.next
        Ember.run.later(function(){
          $fadeBg.addClass('fade-bg-show');
        },111);
      }
      
    },11);
    //},200000);
    
  },
  
  didInitAttrs() {
    Ember.run.scheduleOnce('afterRender', this, this.setup);
  },
  
  didUpdateAttrs( options ) {
    //var o = options.oldAttrs;
    var n = options.newAttrs;
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    
    if(Blackout.isEmpty(n.imageClass) && Blackout.isEmpty(n.imageUrl)){
      
      this.fadeOutImage( $fadeBg, this.afterFadeoutBound );
    
    } else {
      
      this.setup();
    
    }
    
  },
  
  resetFade(){
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    
    if(this.get('lastImageClass')){
      $fadeBg.removeClass(this.get('lastImageClass'));
      this.set('lastImageClass',false);
    }
    
    if(this.get('lastImageUrl')){
      $fadeBg.css('background-image','none');
      this.set('lastImageUrl',false);
    }
    
    $fadeBg.removeClass('fade-bg-out fade-bg-show fade-bg-out fade-bg-show fade-bg-immediate');
    
    $fadeBg.off(Ember.Blackout.afterCSSTransition, this.afterFadeoutBound);
    $fadeBg.off(Ember.Blackout.afterCSSTransition, this.fadeInImageBound);
    
  },
  
  afterFadeout(e){
    
    // Ensure animation end runs only once
    if(!this.get('animationEndType') || this.get('animationEndType')===e.type){
      
      this.resetFade();
      this.set('animationEndType',e.type);
      
    }
    
  },
  
  assertImageRes(w,h) {
    
    let minRes = this.get('minResolution');
    let $fadeBg = this.$().findClosest('.fade-bg');
    
    if(w<minRes && h<minRes) {
      
      // Hide
      $fadeBg.slideUp();
      
      return false;
      
    }
      
    // Show
    $fadeBg.slideDown();
    
    return true;
    
  },
  
});
