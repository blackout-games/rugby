import Ember from 'ember';
import ResponsiveNav from '../responsive-nav/component';
import MenuData from '../../utils/menu';
var $ = Ember.$;

export default ResponsiveNav.extend({
  testSidebar: false,
  prefs: Ember.inject.service('preferences'),
  
  // Settings
  selector: '#nav-sidebar,#nav-panel,#nav-body,#nav-touch-blocker,#nav-topbar,.page-bg',
  disableHideSelector: '#nav-tabbar,#tabbar-balloon,#nav-sidebar,#nav-panel,#nav-touch-blocker',
  disableClassSelector: 'body,#nav-body',
  disableBottomClassSelector: 'body,#nav-body,#nav-sidebar-close,#tabbar-balloon,#nav-menu-buffer-mobile',
  
  // Visual settings
  alternativeAnimationMode: true,
  allowBlur: false,
  blockerDarkness: 0.444,
  
  // Top bar (Removed since iOS9 has bad support)
  allowTopbar: false,
  topBarHeight: 59,
  topBarBuffer: 100,
  
  // Communicators
  backToTopButtonIsShowing: false,
  subNavButtonIsShowing: false,
  
  // --------------------------------- Computed
  
  menuButtonText: Ember.computed('media.isJumbo','navIsOpen','i18n.locale',function(){
    
    if( this.get('media.isJumbo') ){
      
      if( this.get('navIsOpen') ){
        return this.get('i18n').t('menu.hide');
      } else {
        return this.get('i18n').t('menu.show');
      }
      
    }
    return this.get('i18n').t('menu.menu');
    
  }),
  
  closeMenuOnScrollTo: Ember.computed('media.isJumbo',function(){
    return !this.get('media.isJumbo');
  }),
  
  // Variables
  
  topBarIsShowing: true,
  bottomTabBarIsShowing: true,
  topBarCollapseAmount: 0,
  tabSwitcherDirection: 'immediate',
  tabSwitcherSelected: 'menuPanel',
  menuSwitcherDirection: 'immediate',
  menuSwitcherSelected: 'managerPanel',
  

  uiEvents: [
    {
      eventName: 'resize',
      callbackName: 'updateSidebarScrollerHeight',
      selector: window,
    }
  ],
  
  updateSidebarScrollerHeight() {
    var windowHeight = $(window).height();
    
    if(this.get('media.isMobile') && this.get('bottomTabBarIsShowing')){
      windowHeight -= $('#nav-tabbar').height();
    }
    $('#sidebar-scroller-parent,#sidebar-scroller').height(windowHeight);
  },

  startListening: Ember.on('init', 'didInsertElement', function() {
    
    // Call this on responsive nav
    this._super();
    
    this.get('EventBus').subscribe('disableGameNav', this, this.disable);
    this.get('EventBus').subscribe('enableGameNav', this, this.enable);
    this.get('EventBus').subscribe('selectMenuLink', this, this.selectMenuLink);
    this.get('EventBus').subscribe('hideBottomTabBar', this, this.hideBottomTabBar);
    this.get('EventBus').subscribe('showBottomTabBar', this, this.showBottomTabBar);
    this.get('EventBus').subscribe('sessionBuilt', this, this.createMenus);
    this.get('EventBus').subscribe('localeChanged', this, this.createMenus);
    
  }),

  stopListening: Ember.on('willDestroyElement', function() {
    
    // Call this on responsive nav
    this._super();
    
    this.get('EventBus').unsubscribe('disableGameNav', this, this.disable);
    this.get('EventBus').unsubscribe('enableGameNav', this, this.enable);
    this.get('EventBus').unsubscribe('selectMenuLink', this, this.selectMenuLink);
    this.get('EventBus').unsubscribe('hideBottomTabBar', this, this.hideBottomTabBar);
    this.get('EventBus').unsubscribe('showBottomTabBar', this, this.showBottomTabBar);
    this.get('EventBus').unsubscribe('sessionBuilt', this, this.createMenus);
    this.get('EventBus').unsubscribe('localeChanged', this, this.createMenus);

  }),

  setup: Ember.on('didInsertElement', function() {
    
    // Call this on responsive nav
    this._super();
    
    var self = this;
    
    if(window.os.touchOS){
      $('body').addClass('touch');
    }
    
    if(window.navigator.standalone){
      $('body').addClass('standalone');
    }
    
    // Alternative animation mode?
    if(this.get('alternativeAnimationMode')){
      $('#nav-sidebar').addClass('alt');
    }
    
    // Allow blur?
    if(this.get('allowBlur')){
      $('#nav-body').addClass('allow-blur');
    }
    
    // Touch blocker darkness
    $('#nav-touch-blocker').css('background-color','rgba(0,0,0,'+this.get('blockerDarkness')+')');
    
    // Lock body on landscape tablets
    if( !window.features.lockBody && (this.get('media.isTablet') || this.get('media.isDesktop')) && ( window.os.iOS || window.os.android ) ){
      window.features.lockBody = true;
    }

    if (window.features.lockBody) {
      $('html,body,#nav-body').addClass('fixed');
      
      if(window.browsers.safariOS && !window.navigator.standalone && this.media.isMobile){
        $('#tabbar-balloon').addClass('safari-ios');
      }

      // Touch start
      this.touchStartHandler = function(e) {
        self.set('lastY', e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0].pageY : self.get('lastY'));
      };
      $(document).on('touchstart', this.touchStartHandler);

      // Touch move
      this.touchMoveHandler = function(e) {
        var lastY = self.get('lastY');
        var thisY = e.originalEvent.changedTouches[0].pageY;
        var direction = thisY > lastY ? 'down' : 'up';

        if (direction === 'down' && $('#nav-body')[0].scrollTop === 0) {
          e.preventDefault();
        } else if (direction === 'up' && ($('#nav-body')[0].scrollTop + $(window).height()) === $('#nav-body')[0].scrollHeight) {
          e.preventDefault();
        }

        self.set('lastY', thisY);
      };
      $(document).on('touchmove', this.touchMoveHandler);

    } else {
      $('html,body,#nav-body').addClass('free');
    }

    // Touch blocker
    this.touchBlocker = function(e) {
      e.preventDefault();
      e.stopPropagation();
    };
    $('#nav-touch-blocker').on('touchstart touchmove', this.touchBlocker).on('click');

    // Top bar for standalone app
    if (this.get('allowTopbar') && window.navigator.standalone) {
      
      // Show topbar
      $('.nav-topbar').removeClass('hidden');
      
      // Style topbar
      $('#nav-topbar').addClass('nav-topbar-standalone');

      this.touchStartForTopBar = function() {

        self.set('touching', true);

        self.set('ogScrollTop', $('#nav-body')[0].scrollTop);
        self.set('ogBarTop', parseInt($('#nav-topbar').css('top')));
        self.set('topBarBufferPassed', null);
        self.set('topBarEnded', null);
      };
      $('#nav-body,#nav-topbar').on('touchstart', this.touchStartForTopBar);

      var animateTime = 222;

      this.hideTopBar = function( force ) {
        
        var topBarIsShowing = this.get('topBarIsShowing');
        
        if( topBarIsShowing || force ){
         
          // Hide nav bar
          $('#nav-topbar').stop().animate({
            top: (22 - self.get('topBarHeight')) + 'px',
          }, animateTime);

          // Hide content
          $('#nav-topbar-content').stop().animate({
            opacity: 0,
          }, animateTime);
          
          $('.loading-slider').css('top','22px');
          
          this.set('topBarIsShowing',false);
          
          if(topBarIsShowing){
            return true;
          }
          
        }

      };

      this.showTopBar = function( force ) {
        
        var topBarIsShowing = this.get('topBarIsShowing');
        
        if( !topBarIsShowing || force ){
          
          // Show nav bar
          $('#nav-topbar').stop().animate({
            top: '0px',
          }, animateTime);

          // Show content
          $('#nav-topbar-content').stop().animate({
            opacity: 1,
          }, animateTime);
          
          $('.loading-slider').css('top',self.get('topBarHeight')+'px');
          
          this.set('topBarIsShowing',true);
          
          if(!topBarIsShowing){
            return true;
          }
          
        }

      };

      this.touchEndForTopBar = function() {

        self.set('touching', false);
        
        var collapse = self.get('topBarCollapseAmount');
        if (collapse > 0 && collapse < 1) {
          
          var prevDirection = self.get('prevDirection');

          if (prevDirection === 'up') {
            self.showTopBar(true);
          } else if (prevDirection === 'down') {
            self.hideTopBar(true);
          }


          /**
           * Cannot do this using scroll. Any programatic updates to scroll prevents momentum scrolling. Which is a bad UX.
           *
           *
          var currentBarTop = parseInt($('#nav-topbar').css('top'));
          var currentScrollTop = $('#nav-body')[0].scrollTop;
          var distanceRemaining = currentBarTop - (-self.get('topBarHeight')) - 22;
          $('#nav-body').stop().animate({
            scrollTop: (currentScrollTop + distanceRemaining) + 'px',
          },222);
           */

        } else {
          
          if( $('#nav-topbar').css('top') === '0px' ){
            self.set('topBarIsShowing',true);
          } else {
            self.set('topBarIsShowing',false);
          }
          
        }

      };
      $('#nav-body,#nav-topbar').on('touchend', this.touchEndForTopBar);

      this.updateTopBarBound = Ember.run.bind(this, this.updateTopBar);
      $('#nav-body').on('scroll', this.updateTopBarBound);
    }
    
    // Ember deprecation prevents us from using .set on didInsertElement
    Ember.run.scheduleOnce('afterRender', this, function(){
      this.autoShowOnLarge();
    });
    
    this.updateUIOnLandscapeTablet();
    this.createMenus();
    this.selectCurrentMenu();
    this.updateSidebarScrollerHeight();

    // For testing
    if (this.get('testSidebar')) {
      this.send('show');
    }

  }),

  clean: Ember.on('willDestroyElement', function() {
    this._super();

    // Touch blocker
    if (this.touchBlocker) {
      $('#nav-touch-blocker').off('touchstart touchmove', this.touchBlocker);
    }

    if (this.touchStartHandler) {
      $(document).off('touchstart', this.touchStartHandler);
    }
    if (this.touchMoveHandler) {
      $(document).off('touchmove', this.touchMoveHandler);
    }
    
    if (window.touchStartForTopBar) {
      $('#nav-body,#nav-topbar').off('touchstart', this.touchStartForTopBar);
    }
    if (window.touchEndForTopBar) {
      $('#nav-body,#nav-topbar').off('touchend', this.touchEndForTopBar);
    }
    if (window.navigator.standalone && this.updateTopBarBound) {
      $('#nav-body').off('scroll', this.updateTopBarBound);
    }

  }),
  
  /**
   * No way to not use an observer here
   */
  autoShowOnLarge: Ember.observer('media.isJumbo', function() {
    
    if( this.get('media.isJumbo') ){
      let menuOpenedOnThisClick = this.show();
      this.selectCurrentMenu( menuOpenedOnThisClick );
    } else {
      this.hide();
    }
    
  }),
  
  /**
   * No way to not use an observer here
   */
  updateUIOnLandscapeTablet: Ember.observer('media.isDesktop', function() {
    
    // Different sidebar spacing for standalone
    if( this.get('media.isDesktop') && window.navigator.standalone ){
      $('#nav-sidebar').addClass('col-override-8');
      $('#nav-tabbar').addClass('col-override-4');
    } else {
      $('#nav-sidebar').removeClass('col-override-8');
      $('#nav-tabbar').removeClass('col-override-4');
    }
    
  }), // isDesktop = landscape tablet
  
  createMenus (){
    
    var self = this;
    
    $.each(MenuData.menus, function( menuName, menuItems ){
      
      $('#'+menuName+'Panel > .menu-links').html('');
      
      $.each(menuItems,function( index, item ){
        
        var realRoute,itemLink,action,routeId;
        
        if(item.hideIfNotAuthenticated && !self.get('session.isAuthenticated')){
          return true;
        }
        
        // Translate item label
        let key = "menu."+Ember.String.dasherize(menuName)+"."+Ember.String.dasherize(item.label);
        item.tLabel = self.get('i18n').t(key);
        
        if(item.tempRoute){
          itemLink = $('<a href="/'+item.tempRoute+'" id="menuItem'+item.route+'" class="btn-a menu-link">'+item.tLabel+'</a>');
          action = 'transitionAction';
          realRoute = item.tempRoute;
          
        } else if(item.route){
          itemLink = $('<a href="/'+item.route+'" id="menuItem'+item.route+'" class="btn-a menu-link">'+item.tLabel+'</a>');
          action = 'transitionAction';
          realRoute = item.route;
          
          if(item.params && item.params.id){
            routeId = item.params.id;
          }
          
        } else if(item.action) {
          itemLink = $('<a class="btn-a menu-link">'+item.tLabel+'</a>');
          let actionName = 'menuAction'+item.label.alphaNumeric();
          action = actionName;
          self.set(actionName,item.action);
        }
        
        if(itemLink){
          itemLink.on('click',function(e){
            e.preventDefault();
            self.sendAction(action,realRoute,routeId);
            self.selectMenuLink(item.route);
            return false;
          });
          $('#'+menuName+'Panel > .menu-links').append(itemLink);
        }
        
      });
    });

    // Manually update hover watchers
    Ember.Blackout.refreshHoverWatchers();
    
  },

  selectCurrentMenu ( menuOpenedOnThisClick ) {
    
    var self = this;
    
    if( self.get('media.isJumbo') && self.get('lastTab') ){
      
      self.selectTab( self.get('lastTab'), self.get('lastTabType'), true, menuOpenedOnThisClick );
      
    } else if( self.get('lastMenu') ){
      
      self.selectTab( self.get('lastMenu'), 'menu', true, menuOpenedOnThisClick );
      
    } else {
      
      var path = window.location.pathname;
      var selected = false;
      
      $.each(MenuData.menus, function(menu, items) {

        $.each(items, function(index, item) {

          if ('/'+item.route === path) {
            self.selectTab(menu, 'menu', true, menuOpenedOnThisClick );
            selected = true;
            return false;
          }

        });
      });
      
      if(!selected){
        self.selectTab('manager', 'menu', true, menuOpenedOnThisClick );
      }
      
    }
    
    this.selectMenuLink();

  },
  
  selectMenuLink ( force ) {
    
    var selectPath;
    if( force ){
      selectPath = force;
    } else {
      var path = window.location.pathname;
      selectPath = path.split('/')[1];
    }
    
    // tmp
    if(selectPath==='coming-soon'){
      return;
    }
    
    // Only select a new menu link if it's not empty (otherwise it breaks home page scroll-to links)
    if(! Ember.isEmpty(selectPath) ){
      
      //log('deselecting all menu links');
      
      $('#nav-panel a.menu-link').removeClass('selected');
      //$('a.menu-link[href="/'+selectPath+'"]').addClass('selected');
      
      //log('selecting menu link ('+selectPath+')');
      $('#menuItem'+selectPath).addClass('selected');
      
    }
    
  },

  updateTopBar() {

    var self = this;

    if (!self.get('touching')) {
      //print('prevent');
      return;
    }

    var ogScrollTop = self.get('ogScrollTop');
    var ogBarTop = self.get('ogBarTop');
    var newTop = $('#nav-body')[0].scrollTop;

    var newHeight = Math.min(self.get('topBarHeight'), Math.max(22, (ogBarTop + self.get('topBarHeight')) + (ogScrollTop - newTop)));

    $('#nav-topbar').css('top', (newHeight - self.get('topBarHeight') + 'px'));
    
    $('.loading-slider').css('top',newHeight + 'px');

    // Update visibility of bar content
    var collapse = (self.get('topBarHeight') - newHeight) / (self.get('topBarHeight') - 22);
    $('#nav-topbar-content').css('opacity', 1 - Math.min(1, collapse * 1.33));

    self.set('topBarCollapseAmount', collapse);

    var prevTop = self.get('prevTop');
    var prevDirection = self.get('prevDirection');
    var direction;
    if (!prevTop) {
      prevTop = 0;
    }

    if (newTop > prevTop) {
      direction = 'down';
    } else if (newTop < prevTop) {
      direction = 'up';
    }

    if (direction) {

      if (direction !== prevDirection) {

        // We've changed direction, update og
        self.set('ogScrollTop', $('#nav-body')[0].scrollTop);
        self.set('ogBarTop', parseInt($('#nav-topbar').css('top')));

      }

      self.set('prevTop', newTop);
      self.set('prevDirection', direction);

    }

  },

  preventBodyScroll() {
    this.bodyScrollPreventer = function(e) {
      e.preventDefault();
    };
    $('#nav-sidebar,#nav-panel').on('touchstart touchmove', this.bodyScrollPreventer);
  },

  allowBodyScroll() {
    $('#nav-sidebar,#nav-panel').off('touchstart touchmove', this.bodyScrollPreventer);
  },

  transitionAction: 'transitionToRoute',
  fbLoginAction: 'loginWithFacebook',
  logoutAction: 'invalidateSession',
  
  actions: {
    clickTab(button) {
      this.selectTab(button.get('tabName'), 'tab');
    },
    clickMenu(button) {
      this.selectTab(button.get('menuName'), 'menu');
    },
    invalidateSession() {
      this.sendAction('logoutAction');
    },
    loginWithFacebook(button) {
      this.sendAction('fbLoginAction',button);
    },
  },

  selectTab(tabName, type, programatic, menuOpenedOnThisClick) {
    
    // Don't select tab if menu panel is not showing
    if( programatic && !this.get('navIsOpen') ){
      return;
    }

    var tab = $('.nav-' + type + '-' + tabName);
    
    // Repeated tap on same tab should just leave menu open?
    //if (!menuOpenedOnThisClick && (tab.hasClass('selected') || tab.hasClass('nav-close'))) {
    if (!menuOpenedOnThisClick && tab.hasClass('nav-close')) {
      
      if( !this.get('media.isJumbo') ){
        
        this.hide();
        
      } else if (tab.hasClass('nav-close') ){
        
        // Close menu on large
        $('#nav-panel,#nav-body,.page-bg').addClass('force-transition');
        if( this.hide() ){
          
          // Do successful hide stuff
          
        }
        
      }

    } else if( tabName === 'menu' ) {
      
      if( menuOpenedOnThisClick === undefined ){
        menuOpenedOnThisClick = this.show();
      }
      this.selectCurrentMenu( menuOpenedOnThisClick );
      
    } else {
      
      if( menuOpenedOnThisClick === undefined ){
        menuOpenedOnThisClick = this.show();
      }
      
      var newButton = $('.nav-' + type + '-' + tabName);
      $('.nav-tab-btn,.nav-menu-btn').removeClass('selected');
      newButton.addClass('selected');
      
      // Munges
      if(type==='menu' && tabName==='info'){
        // For showing info tab on left in home page menu on mobile
        type = 'tab';
      }
      
      if( type === 'menu' ){
        
        this.set('lastMenu',tabName);
        
      } else {
        
        this.set('lastMenu',null);
        
      }
      
      // Determine direction
      var direction = 'immediate';
      var lastTab = this.get('lastTab');
      
      if(!menuOpenedOnThisClick){
        if( this.tabIsBefore(tabName,lastTab) ){
          direction = 'right';
        } else {
          direction = 'left';
        }
      }
      
      if( type === 'tab' ){
        this.set('tabSwitcherDirection',direction);
        this.set('tabSwitcherSelected', tabName + 'Panel' );
      } else {
        
        // Select menu tab
        if(!menuOpenedOnThisClick){
          this.set('tabSwitcherDirection','right');
        } else {
          this.set('tabSwitcherDirection','immediate');
        }
        this.set('tabSwitcherSelected','menuPanel');
        
        // Select menu
        if( this.get('lastTabSelected') !== 'menu' ){
          this.set('menuSwitcherDirection','immediate');
        } else {
          this.set('menuSwitcherDirection',direction);
        }
        
        this.set('menuSwitcherSelected',tabName+'Panel');
        this.set('lastTabSelected','menu');
        
      }
      
      this.set('lastTab',tabName);
      this.set('lastTabType',type);
      if( type === 'tab' ){
        this.set('lastTabSelected',tabName);
      }

    }

  },
  
  tabIsBefore( newTabName, oldTabName ){
    
    var isBefore = false;
    
    $.each(MenuData.tabsList,function(index,tabName){
      
      if(tabName === oldTabName){
        isBefore = false;
        return false;
      } else if(tabName === newTabName){
        isBefore = true;
        return false;
      }
      
    });
    
    return isBefore;
    
  },

  deselectAllTabs() {
    $('.nav-tab-btn,.nav-menu-btn').removeClass('selected');
  },
      
  updateLoadingSlider(menuOpened) {
    
    var $slider = $('.loading-slider');
    
    if(menuOpened){
      $slider.data('menuOpen',true);
      $slider.css('top','0px');
    } else {
      $slider.data('menuOpen',false);
      if($slider.data('normalLocation')){
        $slider.css('top',$slider.data('normalLocation'));
      }
    }
    
  },

  show() {
    
    if (this._super()) {
      
      if( !$('.nav-tab-btn,.nav-menu-btn').hasClass('selected') ){
        this.selectCurrentMenu( true );
      }
      
      $('.nav-burger,.nav-tab-menu').addClass('nav-close');

      $('#nav-touch-blocker').on('mousedown touchstart', this.bodyTouchBound);

      this.preventBodyScroll();

      if (this.hideTopBar && this.get('media.isMobile')) {
        var wasShowing = this.hideTopBar(true);
        this.set('topbarWasShowing',wasShowing);
      }
      
      $('#sidebar-scroller')[0].scrollTop = 0;
      Ember.run.next(function(){
        $('#sidebar-scroller').perfectScrollbar('update');
      });
      
      this.updateLoadingSlider(true);

      return true;
    }
  },

  hide() {
    if (this._super()) {
      
      this.deselectAllTabs();
      $('.nav-burger,.nav-tab-menu').removeClass('nav-close');

      this.allowBodyScroll();

      $('#nav-touch-blocker').off('mousedown touchstart', this.bodyTouchBound);
      
      if (this.get('topbarWasShowing')) {
        this.showTopBar(true);
      }
      
      this.updateLoadingSlider(false);

      return true;
    }
  },
  
  disable () {
    Ember.$(this.get('disableHideSelector')).addClass('hidden');
    Ember.$(this.get('disableClassSelector')).addClass('nav-disabled');
  },
  
  enable () {
    Ember.$(this.get('disableHideSelector')).removeClass('hidden');
    Ember.$(this.get('disableClassSelector')).removeClass('nav-disabled').addClass('resizing');
    var self = this;
    Ember.run.next(function(){
      Ember.$(self.get('disableClassSelector')).removeClass('resizing');
    });
  },
  
  /**
   * Only when tab bar is at the bottom of the screen do these functions apply, i.e. mobile only
   */
  hideBottomTabBar() {
    $('#nav-tabbar').addClass('hidden-xs');
    $(this.get('disableBottomClassSelector')).addClass('bottom-nav-disabled');
    this.get('EventBus').publish('fixedItemsShift');
    this.set('bottomTabBarIsShowing',false);
    $('#nav-body-inner').addClass('full-body');
    this.updateSidebarScrollerHeight();
  },
  showBottomTabBar() {
    $('#nav-tabbar').removeClass('hidden-xs');
    $(this.get('disableBottomClassSelector')).removeClass('bottom-nav-disabled');
    this.get('EventBus').publish('fixedItemsShift');
    this.set('bottomTabBarIsShowing',true);
    $('#nav-body-inner').removeClass('full-body');
    this.updateSidebarScrollerHeight();
  },
  
  /**
   * Callback when menu is switched
   */
  
  scrollMenuBackToTop(){
    
    var handleScrollStop = function(){
      $(this).stop().off('touchstart wheel',handleScrollStop);
    };
      
    if($('#sidebar-scroller')[0].scrollTop!==0){
      $('#sidebar-scroller').animate({ scrollTop: 0 }, 400, 'easeOutExpo').off('touchstart wheel',handleScrollStop).on('touchstart wheel',handleScrollStop);
    }
  
  },
  
  /**
   * Callback after menu is switched
   */
  
  updateMenuScrollArea(){
    
    $('#sidebar-scroller').perfectScrollbar('update');
    
  }

});
