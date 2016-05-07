import Ember from 'ember';

// Don't do this here, do it on the scrolling element (This is automatically applied in normal-scroll)
//import PreventBodyScroll from '../../mixins/prevent-body-scroll';

export default Ember.Component.extend({

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
    this.get('eventBus').subscribe('hideSubNav',this,this.hide);

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
    let $panel = this.$('#sub-nav-panel');

    // Mobile mode
    if(this.get('navButtonIsShowing')){

      // Clear any element level styles
      this.resetStyle($panel);

      Ember.run.next(() => {
        this.updateSubNavMobile();
      });

      // Unfade
      Ember.Blackout.unFadeInUp($panel);

    } else {

      Ember.run.next(() => {
        this.updateSubNavNonMobile(true,animationAlreadyTookPlace);
      });

    }
  },

  createSubNav($subNavContent,opts){

    // Globalise opts
    this.set('opts',opts);

    // See if custom button icon is set
    if(opts.buttonIcon){
      this.set('buttonIcon',opts.buttonIcon);
    }

    // Check for header
    let $headerContent = $subNavContent.find('.sub-nav-header');
    let $header = this.$('#sub-nav-header');
    if($headerContent.length){

      this.set('subNavHeader',true);
      this.set('headerParent',$headerContent.parent());
      this.set('headerIndex',$headerContent.index());
      this.set('headerContent',$headerContent);
      $header.empty().append($headerContent);
      
    }

    // Add content to sub-nav panel
    this.set('contentParent',$subNavContent.parent());
    this.set('contentIndex',$subNavContent.index());
    this.$('#sub-nav-scroller').empty().append($subNavContent);
    
    this.watchMenuLinks();

    // Manually update hover watchers
    Ember.Blackout.refreshHoverWatchers();

    /**
     * Only update based on opts changes for now
     * Later may need to also update content on re-renders.
     */
    if(!this.get('navIsActive')){

      // Fade in the button (will still be hidden if not mobile)
      this.$('#sub-nav-button').fadeIn();

      // Save elements for use later
      this.set('$subNavContent',$subNavContent);

      // Set nav as active (i.e. we're on a page containing sub-nav)
      this.set('navIsActive',true);

      // Show subnav
      this.$('#sub-nav-panel').addClass('active');

      Ember.$('#nav-body,#page-bg').addClass('sub-nav-showing');

    }

    // Allow transitions again
    Ember.run.later(()=>{
      this.$('#sub-nav-panel').removeClass('inactive');
    });
    
    // Run a resize
    this.handleResize();

  },

  destroySubNav(/*id*/){
      
    this.$('#sub-nav-button').fadeOut();
    let $panel = this.$('#sub-nav-panel');

    // Prevent transitions
    $panel.addClass('inactive');

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
    
    // Return sub nav content node back to it's parent
    let $subNavContent = this.get('$subNavContent');
    let $parent = this.get('contentParent');
    let index = this.get('contentIndex');
    $parent.insertAt(index,$subNavContent);
    
    // Return header if set
    if(this.get('subNavHeader')){
      let $headerContent = this.get('headerContent');
      let $parent = this.get('headerParent');
      let index = this.get('headerIndex');
      $parent.insertAt(index,$headerContent);
      this.set('subNavHeader',false);
    }

    this.set('navIsActive',false);

    Ember.$('#nav-body,#page-bg').removeClass('sub-nav-showing');

    this.hide( true );
    
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
    
    let headerHeight = 0;
    if(this.get('subNavHeader')){
      headerHeight = this.$('#sub-nav-header').outerHeight();
    }

    // Update perfect scroll height
    let padding = 0;
    $scoller.height(Math.min(contentHeight+1,maxHeight-padding*2 - tabBarHeight - headerHeight));
    
    this.updateScrollArea();

  },

  updateSubNavNonMobile( /*mediaUpdateOnly, animationAlreadyTookPlace*/ ){

    if(!this.get('navIsActive')){
      return;
    }
    
    if(this.get('subNavHeader')){
      this.$('#sub-nav-scroller').css('height','calc(100vh - '+ this.$('#sub-nav-header').outerHeight() +'px)');
    }

    this.updateScrollArea();

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
    // Don't debounce, otherwise we can't preventDefault
    this.$('#sub-nav-scroller a.menu-link').on('click',this,this.handleMenuLink);
  },

  unwatchMenuLinks (){
    this.$('#sub-nav-scroller a.menu-link').off('click',this,this.handleMenuLink);
  },

  handleMenuLink ( e ) {
    let self = e.data;
    let $link = Ember.$(this);
    self.selectMenuLink(self,$link,e,true);
  },

  selectMenuLinkExternal(id){
    let $link = this.$('#'+id);
    if($link.length){
      this.selectMenuLink(this,$link,null,true);
    }
  },

  selectMenuLink ( self, $link, e, wasExternal ) {
    
    Ember.$('#sub-nav-scroller a.menu-link').removeClass('selected');
    
    if($link && $link.length){
      
      // Make sure link has an id
      let linkId = $link.attr('id');
      if(linkId){
        
        if(e || wasExternal){
          
          let linkId = $link.attr('id').replace('sub-menu-link-','');
          
          // If on player route
          if(self && self.get('opts.keepSubRoutes')){
            let route = Ember.Blackout.getCurrentRoute();
            
            Ember.Blackout.transitionTo(route,linkId);
            
          // If on squad route
          } else {
            Ember.Blackout.transitionTo('players.player',linkId);
          }
          if(e){
            e.preventDefault();
          }

        }
        
        /**
         * 'next' added when we were seeing the player in the sub-nav get deselected upon clicking one of the circle player-nav buttons first after page load
         */
        $link.addClass('selected');
        Ember.run.next(()=>{
          $link.addClass('selected');
        });
        
      } else {
        Ember.Logger.warn('Sub menu link doesn\'t have an Id');
      }

    } else {
      Ember.$('#sub-nav-scroller a.menu-link').removeClass('selected');
      Ember.$(this).addClass('selected');
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
    if(this.get('isOpen') && (this.get('media.isMobile') || this.get('media.isTablet'))){
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
