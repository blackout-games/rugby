import Ember from 'ember';
import PreventBodyScroll from '../../mixins/prevent-body-scroll';

export default Ember.Component.extend(PreventBodyScroll,{
  
  navIsActive: false,
  navButtonIsShowing: false,
  
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
    this.get('eventBus').subscribe('selectSubNavLink',this,this.selectMenuLinkExternal);
    
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
    
    // See if custom button icon is set
    if(opts.buttonIcon){
      this.set('buttonIcon',opts.buttonIcon);
    }
    
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
    
    // Set nav as active (i.e. we're on a page containing sub-nav)
    this.set('navIsActive',true);
    
    // Show subnav
    this.$('#sub-nav-panel').addClass('active');
    
    Ember.$('#nav-body').addClass('sub-nav-showing');
    
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
    
    let tabBarHeight = 0;
    // If is mobile, allow for tab bar
    if(this.get('media.isMobile')){
      tabBarHeight = 49;
    }
    
    // Update perfect scroll height
    let padding = 0;
    $scoller.height(Math.min(contentHeight+1,maxHeight-padding*2 - tabBarHeight));
    
    this.updateScrollArea();
    
  },
  
  updateSubNavNonMobile( /*mediaUpdateOnly, animationAlreadyTookPlace*/ ){
    
    if(!this.get('navIsActive')){
      return;
    }
    
    this.updateScrollArea();
    
  },
  
  destroySubNav(/*id*/){
    this.$('#sub-nav-button').fadeOut();
    let $panel = this.$('#sub-nav-panel');
    
    // If in non-mobile mode, fade the panel out
    Ember.Blackout.unFadeInUp($panel);
    
    // Clear any element level styles
    this.resetStyle($panel);
    
    // Clear custom button icon
    this.set('buttonIcon',null);
    
    $panel.css({
      position: 'fixed',
      top: 0,
    });
    
    this.unwatchMenuLinks();
    Ember.$('#sub-nav-scroller').html('');
    
    this.set('navIsActive',false);
    
    // Clean references
    this.set('$subNavContent',null);
    this.set('$innerContent',null);
    
    Ember.$('#nav-body').removeClass('sub-nav-showing');
    
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
    let $link = Ember.$(this);
    Ember.run.debounce(this,self.selectMenuLink,self,$link,e,1);
    
  },
  
  selectMenuLinkExternal(id){
    let $link = this.$('#'+id);
    if($link.length){
      this.selectMenuLink(this,$link,null,true);
    }
  },
  
  selectMenuLink ( self, $link, e, wasExternal ) {
    
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
      
      if(self && self.get('opts.keepSubRoutes') && (e || wasExternal)){
        
        let route = Ember.Blackout.getCurrentRoute();
        let linkId = $link.attr('id').replace('sub-menu-link-','');
        Ember.Blackout.transitionTo(route,linkId);
        if(e){
          e.preventDefault();
        }
        
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
      let customIcon = this.get('buttonIcon');
      this.$('#sub-nav-button i').removeClass('icon-md '+(customIcon?customIcon:'icon-sub-menu')).addClass('icon-cancel icon-smd');
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
      let customIcon = this.get('buttonIcon');
      this.$('#sub-nav-button i').removeClass('icon-cancel icon-smd').addClass('icon-md '+(customIcon?customIcon:'icon-sub-menu'));
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
