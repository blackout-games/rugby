import Ember from 'ember';

export default Ember.Component.extend({
  
  navIsActive: false,
  navButtonIsShowing: false,
  
  setup: Ember.on('init',function(){
    
    this.get('EventBus').subscribe('createSubNav',this,this.createSubNav);
    this.get('EventBus').subscribe('destroySubNav',this,this.destroySubNav);
    
    this.blockerTouchBound = Ember.run.bind(this,this.blockerTouch);
    this.handleScrollBound = Ember.run.bind(this,this.handleScroll);
    this.handleResizeBound = Ember.run.bind(this,this.handleResize);
    
    // Read JS animate distance
    this.set('animateDistance',parseInt(Ember.Blackout.getCSSValue('height','animate-distance')));
    
  }),
  
  setupOnInsert: Ember.on('didInsertElement',function(){
    if(!this.get('navIsActive')){
      this.$('#sub-nav-button').hide();
    }
  }),

  uiEvents: [
    {
      eventName: 'scroll',
      callbackName: 'handleScrollBound',
      selectorFunction: 'getScrollSelectorToWatch',
    },
    {
      eventName: 'resize',
      callbackName: 'handleResizeBound',
      selector: window,
    }
  ],
  
  uiEventsActive: Ember.computed('navIsActive',function(){
    this.updateUIEventsStatus(this.get('navIsActive'));
    return this.get('navIsActive');
  }),
  
  handleScroll(){
    if(!this.get('navButtonIsShowing')){
      let $panel = Ember.$('#sub-nav-panel');
      let $panelParent = $panel.parent();
      
      let eTop = $panelParent.offset().top; //get the offset top of the element
      let wTop = Ember.$(window).scrollTop(); //position of the ele w.r.t window
      
      let sPos = eTop-wTop;
      if(sPos<0){
        $panel.css('margin-top',(0-sPos)+'px');
      } else {
        $panel.css('margin-top',0);
      }
      this.updateSubNavNonMobile();
    } else {
      this.updateSubNavMobile();
    }
  },
  
  handleResize(){
    if(!this.get('navButtonIsShowing')){
      this.updateSubNavNonMobile();
    } else {
      this.updateSubNavMobile();
    }
  },
  
  getScrollSelectorToWatch() {
    var scrollSelector = this.get('scrollElementSelector');
    
    if(!scrollSelector){
      if (window.features.lockBody) {
        scrollSelector = '#nav-body';
      } else {
        scrollSelector = window;
      }
    }
    
    return scrollSelector;
  },
  
  alreadyActive: false,
  mediaWatcher: Ember.observer('media.isTablet','navIsActive',function(){
    this.set('navButtonIsShowing',this.get('navIsActive') && (this.get('media.isMobile') || this.get('media.isTablet')));
    if(this.get('navIsActive')){
      this.updateSubNavOnMediaChange( this.get('alreadyActive') );
    }
    this.set('alreadyActive',this.get('navIsActive'));
  }),
  
  createSubNav($subNavContent){
    
    // Determine content holder
    let $innerContent = Ember.$('#sub-nav-content').length ? Ember.$('#sub-nav-content') : $subNavContent;
    
    // Get sub-nav content from template where sub-nav-content is consumed
    let content = $innerContent.html();
    $innerContent.html('');
    
    // Fade in the button (will still be hidden if not mobile)
    this.$('#sub-nav-button').fadeIn();
    
    // Add content to sub-nav panel
    Ember.$('#sub-nav-scroller').html(content);
    
    // Save elements for use later
    this.set('$subNavContent',$subNavContent);
    this.set('$innerContent',$innerContent);
    this.set('content',content);
    
    // Set nav as active (i.e. we're on a page containing sub-nav)
    this.set('navIsActive',true);
    
  },
  
  updateSubNavOnMediaChange( animationAlreadyTookPlace ){
    
    // Get elements saved on setup
    let $subNavContent = this.get('$subNavContent');
    let $panel = this.$('#sub-nav-panel');
    
    // Mobile mode
    if(this.get('navButtonIsShowing')){
      
      // Hide normal sub-nav-content component added by consumer template
      $subNavContent.hide();
      
      // Clear any element level styles
      $panel.removeAttr('style');
      
      Ember.run.next(() => {
        this.updateSubNavMobile();
      });
      
      // Unfade
      Ember.Blackout.unFadeInUp($panel);
      
    } else {
      
      // Show normal sub-nav-content component added by consumer template
      $subNavContent.show();
      
      Ember.run.next(() => {
        this.updateSubNavNonMobile(true,animationAlreadyTookPlace);
      });
      
      // Fade
      Ember.Blackout.fadeInUp($panel);
      
    }
    
    this.updateScrollArea();
  },
  
  updateSubNavMobile(){
    
    let $scoller = Ember.$('#sub-nav-scroller');
    
    // Determine max height, leaving room for back to top button
    let contentHeight = $scoller[0].scrollHeight;
    let maxHeight = Ember.$(window).height();
    //let h = Math.min(contentHeight,maxHeight);
    
    // Update perfect scroll height
    let padding = 20;
    $scoller.height(Math.min(contentHeight+1,maxHeight-padding*2 - 55));
    
  },
  
  updateSubNavNonMobile( mediaUpdateOnly, animationAlreadyTookPlace ){
    
    let $innerContent = this.get('$innerContent');
    let $panel = Ember.$('#sub-nav-panel');
    let $scoller = Ember.$('#sub-nav-scroller');
    
    // Get properties of sub-nav-content
    let pos = $innerContent.offsetWindow();
    let w = $innerContent.outerWidth();
    let margin = 30;
    let padding = 30;
    
    // Adjust for animation
    if(mediaUpdateOnly && !animationAlreadyTookPlace){
      pos.top -= this.get('animateDistance');
    }
    
    // Fix at top
    if(pos.top < margin){
      pos.top = margin;
    }
    
    // Determine max height, leaving room for back to top button
    let contentHeight = $scoller[0].scrollHeight;
    let maxHeight = Ember.$(window).height() - 133 - pos.top;
    let h = Math.min(contentHeight,maxHeight);
    
    $panel.css({
      top: pos.top,
      position: 'fixed',
      left: pos.left,
      width: w,
      height: h,
      'max-height': maxHeight,
    });
    
    // Update perfect scroll height
    $scoller.height(Math.min(contentHeight+1,maxHeight-padding*2));
    
  },
  
  destroySubNav(/*id*/){
    this.$('#sub-nav-button').fadeOut();
    let $panel = this.$('#sub-nav-panel');
    
    // If in non-mobile mode, fade the panel out
    Ember.Blackout.unFadeInUp($panel);
    
    // Clear any element level styles
    $panel.removeAttr('style');
    
    this.set('navIsActive',false);
    
    this.hide();
  },
  
  blockerTouch() {
    
    if( !this.get('media.isJumbo') ){
      this.hide();
    }
    
  },
  
  open(){
    if(!this.get('isOpen')){
      this.$('#sub-nav-panel,#sub-nav-touch-blocker').addClass('open');
      this.$('#sub-nav-touch-blocker').on('mousedown touchstart', this.blockerTouchBound);
      this.$('i').removeClass('icon-sub-menu icon-md').addClass('icon-cancel icon-smd');
      this.set('isOpen',true);
      return true;
    }
    return false;
  },
  
  hide(){
    if(this.get('isOpen')){
      this.$('#sub-nav-panel,#sub-nav-touch-blocker').removeClass('open');
      this.$('#sub-nav-touch-blocker').off('mousedown touchstart', this.blockerTouchBound);
      this.$('i').removeClass('icon-cancel icon-smd').addClass('icon-sub-menu icon-md');
      this.set('isOpen',false);
      return true;
    }
    return false;
  },
  
  actions: {
    toggleSubNav() {
      
      if(this.get('isOpen')){
        this.hide();
      } else {
        this.open();
      }
      
    },
  },
  
  /**
   * Callback after route is switched
   */
  
  updateScrollArea(){
    
    Ember.run.next(function(){
      Ember.$('#sub-nav-scroller').perfectScrollbar('update');
    });
    
  }
  
});
