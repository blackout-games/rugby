import Ember from 'ember';
const { Blackout } = Ember;

export default Ember.Component.extend({
  
  classNames: ['fade-bg-default'],
  defaultColor: 'tomato',
  imageUrl: '',
  imageClass: '',
  
  // Internal
  lastImageClass: '',
  
  /**
   * Only supports predefined image classes for now
   * TODO: Support image url
   */
  
  bindFunctions: Ember.on('init',function(){
    this.afterFadeoutBound = Ember.run.bind(this,this.afterFadeout);
  }),
  
  setup(){
    
    var $fadeBg = this.$().findClosest('.fade-bg');
    var self = this;
    
    // Set default background color
    this.$().css('background-color',this.get('defaultColor'));
    
    if(this.get('imageClass')){
      
      // Get image url
      var url = Ember.Blackout.getCSSPseudoValue('background-image',this.get('imageClass'),':before').replace(/url\(/,'').rtrim(')');
      
      // Load image
      Ember.Blackout.preloadImage(url,function() {
        
        // The background may not have been completely faded out from last fade-out when we reset, so it may seem like a quick fade-in from here. But I think that works well i.e. fast transition = fast fades (Jeremy)
        self.resetFade();
        
        $fadeBg.addClass(self.get('imageClass') + ' fade-bg-ready');
        self.set('lastImageClass',self.get('imageClass'));
        
        Ember.run.later(function(){
          $fadeBg.addClass('fade-bg-show');
        },50);
      });
    }
    
  },
  
  didUpdateAttrs( options ) {
    var o = options.oldAttrs;
    var n = options.newAttrs;
    
    // -------------------------- Check for new image
    
    if( Blackout.isEmpty(o.imageClass) && Blackout.isEmpty(o.imageUrl) && (!Blackout.isEmpty(n.imageClass) || !Blackout.isEmpty(n.imageUrl)) ){
      
      this.setup();
      
    }
    
    // -------------------------- Check for remove image
    
    if(Ember.isEmpty(this.get('imageClass'))){
      
      var $fadeBg = this.$().findClosest('.fade-bg');
      $fadeBg.addClass('fade-bg-out').removeClass('fade-bg-show');
      
      $fadeBg.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.afterFadeoutBound);
      
    }
    
  },
  
  resetFade(){
      
    var $fadeBg = this.$().findClosest('.fade-bg');
    
    if(this.get('lastImageClass')){
      
      $fadeBg.removeClass(this.get('lastImageClass'));
      
    }
    
    $fadeBg.removeClass('fade-bg-out fade-bg-show');
    
    $fadeBg.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.afterFadeoutBound);
    
  },
  
  afterFadeout(e){
    
    // Ensure animation end runs only once
    if(!this.get('animationEndType') || this.get('animationEndType')===e.type){
      
      this.resetFade();
      this.set('animationEndType',e.type);
      
    }
    
  }
  
});
