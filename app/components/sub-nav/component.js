import Ember from 'ember';
import PreventBodyScroll from '../../mixins/prevent-body-scroll';

export default Ember.Component.extend(PreventBodyScroll,{
  
  navIsActive: false,
  navButtonIsShowing: false,
  subNavMode: '',
  setNavMode: 'd', // a-d
  
  // Prevent body scroll
  preventBodyScrollSelectors: ['#sub-nav-scroller'],
  
  // UI Events
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
  
  setup: Ember.on('init',function(){
    
    this.get('eventBus').subscribe('createSubNav',this,this.createSubNav);
    this.get('eventBus').subscribe('destroySubNav',this,this.destroySubNav);
    
    this.blockerTouchBound = Ember.run.bind(this,this.blockerTouch);
    this.handleScrollBound = Ember.run.bind(this,this.handleScroll);
    this.handleResizeBound = Ember.run.bind(this,this.handleResize);
    this.selectMenuLinkBound = Ember.run.bind(this,this.selectMenuLink);
    
    // Read JS animate distance
    this.set('animateDistance',parseInt(Ember.Blackout.getCSSValue('height','animate-distance')));
    
  }),
  
  setupOnInsert: Ember.on('didInsertElement',function(){
    
    if(!this.get('navIsActive')){
      this.$('#sub-nav-button').hide();
    }
    
  }),
  
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
    this.updateScrollArea();
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
  
  updateSubNavOnMediaChange( animationAlreadyTookPlace ){
    
    // Get elements saved on setup
    let $subNavContent = this.get('$subNavContent');
    let $panel = this.$('#sub-nav-panel');
    
    // Mobile mode
    if(this.get('navButtonIsShowing')){
      
      // Hide normal sub-nav-content component added by consumer template
      $subNavContent.hide();
      
      // Clear any element level styles
      this.resetStyle($panel);
      
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
      
      if(this.get('subNavMode') !== 'd'){
        // Fade
        Ember.Blackout.animateUI($panel);
      }
      
    }
  },
  
  createSubNav($subNavContent,opts){
    
    // Globalise opts
    this.set('opts',opts);
    
    // Determine content holder
    let $innerContent = Ember.$('#sub-nav-content').length ? Ember.$('#sub-nav-content') : $subNavContent;
    
    // Get sub-nav content from template where sub-nav-content is consumed
    let content = $innerContent.html();
    $innerContent.html('');
    
    // Fade in the button (will still be hidden if not mobile)
    this.$('#sub-nav-button').fadeIn();
    
    // Add content to sub-nav panel
    Ember.$('#sub-nav-scroller').html(content);
    this.watchMenuLinks();
    
    // Manually update hover watchers
    Ember.Blackout.refreshHoverWatchers();
    
    // Save elements for use later
    this.set('$subNavContent',$subNavContent);
    this.set('$innerContent',$innerContent);
    this.set('content',content);
    
    // Set mode
    this.set('subNavMode',this.get('setNavMode'));
    
    // Set nav as active (i.e. we're on a page containing sub-nav)
    this.set('navIsActive',true);
    
    // Show subnav
    this.$('#sub-nav-panel').addClass('active');
    
  },
  
  updateSubNavMobile(){
    
    if(!this.get('navIsActive')){
      return;
    }
    
    let $scoller = Ember.$('#sub-nav-scroller');
    
    // Determine max height, leaving room for back to top button
    let contentHeight = $scoller[0].scrollHeight;
    let maxHeight = Ember.$(window).height();
    //let h = Math.min(contentHeight,maxHeight);
    
    // Update perfect scroll height
    let padding = 0;
    $scoller.height(Math.min(contentHeight+1,maxHeight-padding*2 - 49));
    
    this.updateScrollArea();
    
  },
  
  updateSubNavNonMobile( mediaUpdateOnly, animationAlreadyTookPlace ){
    
    if(!this.get('navIsActive')){
      return;
    }
    
    let subNavMode = this.get('subNavMode');
    
    let $innerContent = this.get('$innerContent');
    let $panel = Ember.$('#sub-nav-panel');
    let $scoller = Ember.$('#sub-nav-scroller');
    
    // Get properties of sub-nav-content
    let pos = $innerContent.offsetWindow();
    let w = $innerContent.outerWidth();
    let margin = 30;
    let padding = 2;
    
    // Adjust for animation
    if(mediaUpdateOnly && !animationAlreadyTookPlace){
      pos.top -= this.get('animateDistance');
    }
    
    // Fix at top
    if(pos.top < margin || subNavMode === 'b' || subNavMode === 'c'){
      pos.top = margin;
    }
    
    // Fix top
    if(subNavMode === 'a'){
      if(this.get('initialTop')){
        pos.top = this.get('initialTop');
      } else {
        this.set('initialTop',pos.top);
      }
    }
    
    // Determine max height, leaving room for back to top button
    let backToTopButtonGap = subNavMode === 'c' ? 103 : 0; // 103
    let contentHeight = $scoller[0].scrollHeight;
    let maxHeight = Ember.$(window).height() - backToTopButtonGap - margin - pos.top;
    let h = Math.min(contentHeight+padding*2+2,maxHeight);
    
    $panel.css({
      top: pos.top,
      position: 'fixed',
      left: pos.left,
      width: w,
      height: h,
      'max-height': maxHeight,
    });
    
    if(subNavMode === 'd'){
      
      $panel.css({
        top: 0,
        left: 'auto',
        right: '0px',
        height: '100vh',
        'max-height': 'none',
        'border-radius': 0,
      });
      
      maxHeight = Ember.$(window).height();
      
    }
    
    // Update perfect scroll height
    $scoller.height(Math.min(contentHeight,maxHeight-padding*2));
    
    this.updateScrollArea();
    
  },
  
  destroySubNav(/*id*/){
    this.$('#sub-nav-button').fadeOut();
    let $panel = this.$('#sub-nav-panel');
    
    // If in non-mobile mode, fade the panel out
    Ember.Blackout.unFadeInUp($panel);
    
    // Clear any element level styles
    this.resetStyle($panel);
    
    $panel.css({
      position: 'fixed',
      top: 0,
    });
    
    this.unwatchMenuLinks();
    Ember.$('#sub-nav-scroller').html('');
    
    // Unset mode
    this.set('subNavMode','');
    
    this.set('navIsActive',false);
    
    this.hide( true );
  },
  
  resetStyle($panel){
    
    $panel.removeAttr('style');
    
  },
  
  blockerTouch() {
    
    if( !this.get('media.isJumbo') && !this.get('media.isDesktop') ){
      this.hide();
    }
    
  },
  
  watchMenuLinks (){
    this.$('#sub-nav-scroller a.menu-link').on('click',this,this.debounceMenuLink);
    
    this.selectMenuLink();
  },
  
  unwatchMenuLinks (){
    this.$('#sub-nav-scroller a.menu-link').off('click',this,this.debounceMenuLink);
  },
  
  debounceMenuLink ( e ) {
    
    let self = e.data;
    
    Ember.run.debounce(this,self.selectMenuLink,self,Ember.$(e.target),e,1);
    
  },
  
  selectMenuLink ( self, $link, e ) {
    
    Ember.$('#sub-nav-scroller a.menu-link').removeClass('selected');
    
    if(!$link){
      var path = window.location.pathname;
      
      let selectPath = path.split('/').reverse();
      selectPath.forEach(linkId=>{
        if(Ember.$('#sub-menu-link-' + linkId).length){
          $link = Ember.$('#sub-menu-link-' + linkId);
        }
      });
      
    }
    
    if($link && $link.length){
      
      if(self && self.get('opts.keepSubRoutes') && e){
        
        let route = Ember.Blackout.getCurrentRoute();
        let linkId = $link.attr('id').replace('sub-menu-link-','');
        Ember.Blackout.transitionTo(route,linkId);
        e.preventDefault();
        
      }
      
      $link.addClass('selected');
      
    } else {
      Ember.$('#sub-nav-scroller a.menu-link').removeClass('selected');
      Ember.$(this).addClass('selected');
    }
    
    if(self){
      self.hide();
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
  
  hide( forGood ){
    if(this.get('isOpen')){
      this.$('#sub-nav-panel,#sub-nav-touch-blocker').removeClass('open').off(Ember.Blackout.afterCSSTransition).on(Ember.Blackout.afterCSSTransition,()=>{
        if(forGood){
          // Remove subnav
          this.$('#sub-nav-panel').removeClass('active');
        }
      });
      this.$('#sub-nav-touch-blocker').off('mousedown touchstart', this.blockerTouchBound);
      this.$('i').removeClass('icon-cancel icon-smd').addClass('icon-sub-menu icon-md');
      this.set('isOpen',false);
      return true;
    } else {
      if(forGood){
        // Remove subnav
        this.$('#sub-nav-panel').removeClass('active');
      }
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
