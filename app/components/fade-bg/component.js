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
  defaultColor: '#e8ebf8',
  
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
  
  bindFunctions: Ember.on('init',function(){
    this.afterFadeoutBound = Ember.run.bind(this,this.afterFadeout);
    this.setupBound = Ember.run.bind(this,this.setup);
  }),
  
  addLoader: Ember.on('didInsertElement',function(){
    
    if(this.get('showLoader')){
      this.$().findClosest('.spinner').removeClass('hidden');
    }
    
  }),
  
  setup(){
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    var self = this;
    
    // Add any extra classes
    if(this.get('bgClass')){
      $fadeBg.addClass(this.get('bgClass'));
    }
    
    if(this.get('placeholderClass')){
      
      // Set placeholder
      this.$().addClass(this.get('placeholderClass'));
      
    } else {
      
      // Set default background color
      this.$().css('background-color',this.get('defaultColor'));
    
    }
    
    if(this.get('imageClass')){
      
      // Get image url
      let url = Ember.Blackout.getCSSPseudoValue('background-image',this.get('imageClass'),':before').replace(/url\(/,'').rtrim(')');
      
      // Load image
      Ember.Blackout.preloadImage(url,function() {
        
        // The background may not have been completely faded out from last fade-out when we reset, so it may seem like a quick fade-in from here. But I think that works well i.e. fast transition = fast fades (Jeremy)
        self.resetFade();
        
        $fadeBg.addClass(self.get('imageClass') + ' fade-bg-ready');
        self.set('lastImageClass',self.get('imageClass'));
        
        self.fadeInImage( $fadeBg );
      });
      
    } else if(this.get('imageUrl')){
      
      // Get image url
      let url = this.get('imageUrl');
      
      // Load image
      Ember.Blackout.preloadImage(url,function() {
        
        // The background may not have been completely faded out from last fade-out when we reset, so it may seem like a quick fade-in from here. But I think that works well i.e. fast transition = fast fades (Jeremy)
        self.resetFade();
        
        // Get a unique className
        let className = 'fade-bg-' + url.hashCode();
        
        // Create a fresh css pseudo rule
        Ember.Blackout.addCSSRule( '.' + className + ':before', 'background-image: url('+url+') !important;');
        
        $fadeBg.addClass('fade-bg-ready' + ' ' + className);
        self.set('lastImageUrl',url);
        
        self.fadeInImage( $fadeBg );
        
      },function(){ // Error
        
        // Hide
        $fadeBg.slideUp();
        
      });
      
    }
    
  },
  
  fadeInImage($fadeBg) {
    
    let self = this;
    
    Ember.run.later(function(){
      
      $fadeBg.addClass('fade-bg-show');
      
      if(self.get('showLoader')){
        self.$().findClosest('.spinner').fadeOut('fast',function(){
          self.$().findClosest('.spinner').remove();
        });
      }
      
    },11);
    //},1000);
    
  },
  
  didReceiveAttrs() {
    Ember.run.scheduleOnce('afterRender', this, this.setup);
  },
  
  didUpdateAttrs( options ) {
    var o = options.oldAttrs;
    var n = options.newAttrs;
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    
    // -------------------------- Check for new image
    
    if( Blackout.isEmpty(o.imageClass) && Blackout.isEmpty(o.imageUrl) && (!Blackout.isEmpty(n.imageClass) || !Blackout.isEmpty(n.imageUrl)) ){
      
      this.setup();
      
      
    // -------------------------- Check for updated image
    
    } else if( o.imageClass !== n.imageClass || o.imageUrl !== n.imageUrl ){
      
      $fadeBg.addClass('fade-bg-out').removeClass('fade-bg-show');
      
      $fadeBg.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.setupBound);
      
      
    // -------------------------- Check for removed image
    
    } else if(Ember.isEmpty(this.get('imageClass'))){
      
      $fadeBg.addClass('fade-bg-out').removeClass('fade-bg-show');
      
      $fadeBg.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.afterFadeoutBound);
      
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
    
    $fadeBg.removeClass('fade-bg-out fade-bg-show fade-bg-out fade-bg-show');
    
    $fadeBg.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.afterFadeoutBound);
    $fadeBg.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.setupBound);
    
  },
  
  afterFadeout(e){
    
    // Ensure animation end runs only once
    if(!this.get('animationEndType') || this.get('animationEndType')===e.type){
      
      this.resetFade();
      this.set('animationEndType',e.type);
      
    }
    
  }
  
});
