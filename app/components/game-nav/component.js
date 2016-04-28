import Ember from 'ember';
import ResponsiveNav from '../responsive-nav/component';
import MenuData from '../../utils/menu';
import PreventBodyScroll from '../../mixins/prevent-body-scroll';
var $ = Ember.$;

export default ResponsiveNav.extend(PreventBodyScroll,{
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
  
  // Prevent body scroll mixin
  preventBodyScrollSelectors: ['#sidebar-scroller'],
  
  // Communicators
  backToTopButtonIsShowing: false,
  subNavButtonIsShowing: false,
  settingsPanelIsShowing: false,
  
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
  tabSwitcherSelected: 'gameNav-menuPanel',
  menuSwitcherDirection: 'immediate',
  menuSwitcherSelected: 'gameNav-managerPanel',
  

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
    
    this.get('eventBus').subscribe('disableGameNav', this, this.disable);
    this.get('eventBus').subscribe('enableGameNav', this, this.enable);
    this.get('eventBus').subscribe('selectMenuLink', this, this.selectMenuLink);
    this.get('eventBus').subscribe('hideBottomTabBar', this, this.hideBottomTabBar);
    this.get('eventBus').subscribe('showBottomTabBar', this, this.showBottomTabBar);
    this.get('eventBus').subscribe('sessionBuilt', this, this.createMenus);
    this.get('eventBus').subscribe('localeChanged', this, this.createMenus);
    
  }),

  stopListening: Ember.on('willDestroyElement', function() {
    
    // Call this on responsive nav
    this._super();
    
    this.get('eventBus').unsubscribe('disableGameNav', this, this.disable);
    this.get('eventBus').unsubscribe('enableGameNav', this, this.enable);
    this.get('eventBus').unsubscribe('selectMenuLink', this, this.selectMenuLink);
    this.get('eventBus').unsubscribe('hideBottomTabBar', this, this.hideBottomTabBar);
    this.get('eventBus').unsubscribe('showBottomTabBar', this, this.showBottomTabBar);
    this.get('eventBus').unsubscribe('sessionBuilt', this, this.createMenus);
    this.get('eventBus').unsubscribe('localeChanged', this, this.createMenus);

  }),

  setup: Ember.on('didInsertElement', function() {
    
    // Call this on responsive nav
    this._super();
    
    if(window.os.touchOS){
      $('body').addClass('touch');
    }
    
    if(window.browsers.standalone){
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
    
    /**
     * This handles the extra body height given in Safari iOS
     * Affects:
     * - Game nav
     * - Float window
     */
    if(window.features.lockBody && window.browsers.safariOS && !window.browsers.standalone && this.media.isMobile){
      $('body').addClass('safari-ios');
    }

    if (window.features.lockBody) {
      $('html,body,#nav-body').addClass('fixed');

      // Touch start
      this.touchStartHandler = (e)=>{
        this.set('lastY', e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0].pageY : this.get('lastY'));
      };
      $(document).on('touchstart', this.touchStartHandler);

      // Touch move
      this.touchMoveHandler = (e)=>{
        var lastY = this.get('lastY');
        var thisY = e.originalEvent.changedTouches[0].pageY;
        var direction = thisY > lastY ? 'down' : 'up';

        if (direction === 'down' && $('#nav-body')[0].scrollTop === 0) {
          e.preventDefault();
        } else if (direction === 'up' && ($('#nav-body')[0].scrollTop + $(window).height()) === $('#nav-body')[0].scrollHeight) {
          e.preventDefault();
        }

        this.set('lastY', thisY);
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
    if (this.get('allowTopbar') && window.browsers.standalone) {
      
      // Show topbar
      $('.nav-topbar').removeClass('hidden');
      
      // Style topbar
      $('#nav-topbar').addClass('nav-topbar-standalone');

      this.touchStartForTopBar = ()=>{

        this.set('touching', true);

        this.set('ogScrollTop', $('#nav-body')[0].scrollTop);
        this.set('ogBarTop', parseInt($('#nav-topbar').css('top')));
        this.set('topBarBufferPassed', null);
        this.set('topBarEnded', null);
      };
      $('#nav-body,#nav-topbar').on('touchstart', this.touchStartForTopBar);

      var animateTime = 222;

      this.hideTopBar = ( force )=>{
        
        var topBarIsShowing = this.get('topBarIsShowing');
        
        if( topBarIsShowing || force ){
         
          // Hide nav bar
          $('#nav-topbar').stop().animate({
            top: (22 - this.get('topBarHeight')) + 'px',
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

      this.showTopBar = ( force )=>{
        
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
          
          $('.loading-slider').css('top',this.get('topBarHeight')+'px');
          
          this.set('topBarIsShowing',true);
          
          if(!topBarIsShowing){
            return true;
          }
          
        }

      };

      this.touchEndForTopBar = ()=>{

        this.set('touching', false);
        
        var collapse = this.get('topBarCollapseAmount');
        if (collapse > 0 && collapse < 1) {
          
          var prevDirection = this.get('prevDirection');

          if (prevDirection === 'up') {
            this.showTopBar(true);
          } else if (prevDirection === 'down') {
            this.hideTopBar(true);
          }


          /**
           * Cannot do this using scroll. Any programatic updates to scroll prevents momentum scrolling. Which is a bad UX.
           *
           *
          var currentBarTop = parseInt($('#nav-topbar').css('top'));
          var currentScrollTop = $('#nav-body')[0].scrollTop;
          var distanceRemaining = currentBarTop - (-this.get('topBarHeight')) - 22;
          $('#nav-body').stop().animate({
            scrollTop: (currentScrollTop + distanceRemaining) + 'px',
          },222);
           */

        } else {
          
          if( $('#nav-topbar').css('top') === '0px' ){
            this.set('topBarIsShowing',true);
          } else {
            this.set('topBarIsShowing',false);
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
    if (window.browsers.standalone && this.updateTopBarBound) {
      $('#nav-body').off('scroll', this.updateTopBarBound);
    }

  }),
  
  /**
   * Deselect misc top level menu items
   * For now is just settings.
   */
  deselectMisc(){
    
    // Settings
    this.set('settingsPanelIsShowing',false);
    
  },
  
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
    if( this.get('media.isDesktop') && window.browsers.standalone ){
      $('#nav-sidebar').addClass('col-override-8');
      $('#nav-tabbar').addClass('col-override-4');
    } else {
      $('#nav-sidebar').removeClass('col-override-8');
      $('#nav-tabbar').removeClass('col-override-4');
    }
    
  }), // isDesktop = landscape tablet
  
  createMenus (){
    
    $.each(MenuData.menus, ( menuName, menuItems )=>{
      
      $('#gameNav-'+menuName+'Panel > .menu-links').html('');
      
      $.each(menuItems,( index, item )=>{
        
        var realRoute,itemLink,action,routeId;
        
        if(item.hideIfNotAuthenticated && !this.get('session.isAuthenticated')){
          return true;
        }
        
        if(item.label){
          // Translate item label
          let key = "menu."+Ember.String.dasherize(menuName)+"."+Ember.String.dasherize(item.label);
          item.tLabel = this.get('i18n').t(key);
        }
        
        // Serialize route name for use as CSS id name
        item.cssRoute = item.route.replace(/\./g,'_');
        
        // Track actionable link
        let addEvent = true;
        
        if(item.menuRoute){
          
          // For routes which don't appear in the menu but will cause a different menu link to highlight
          itemLink = $('<a id="menuItem_'+item.cssRoute+'" class="menu-link hidden" data-menu-route="'+item.menuRoute+'"></a>');
          addEvent = false;
          
        } else if(item.tempRoute){
          itemLink = $('<a href="/'+item.tempRoute+'" id="menuItem_'+item.cssRoute+'" class="btn-a menu-link">'+item.tLabel+'</a>');
          action = 'transitionAction';
          realRoute = item.tempRoute;
          
        } else if(item.route){
          itemLink = $('<a href="/'+item.route+'" id="menuItem_'+item.cssRoute+'" class="btn-a menu-link">'+item.tLabel+'</a>');
          action = 'transitionAction';
          realRoute = item.route;
          
          if(item.params && item.params.id){
            routeId = item.params.id;
          }
          
        } else if(item.action) {
          itemLink = $('<a class="btn-a menu-link">'+item.tLabel+'</a>');
          let actionName = 'menuAction'+item.label.alphaNumeric();
          action = actionName;
          this.set(actionName,item.action);
        }
        
        if(itemLink){
          
          if(addEvent){
            itemLink.on('click',(e)=>{
              e.preventDefault();
              this.sendAction(action,realRoute,routeId);
              this.selectMenuLink(item.route);
              return false;
            });
          }
          
          $('#gameNav-'+menuName+'Panel > .menu-links').append(itemLink);
        }
        
      });
    });

    // Manually update hover watchers
    Ember.Blackout.refreshHoverWatchers();
    
  },

  selectCurrentMenu ( menuOpenedOnThisClick ) {
    
    let isJumbo = this.get('media.isJumbo') && this.get('lastTab');
    
    if(this.get('lastMenu')==='settings'){
      
      //this.set('lastTabType','menu');
      
      if(menuOpenedOnThisClick){
        
        this.selectTab( 'settings', 'menu', true, menuOpenedOnThisClick );
        this.set('settingsPanelIsShowing',true);
        
      } else {
        
        this.selectTab( this.get('lastMenuBeforeSettings'), 'menu', true, menuOpenedOnThisClick );
        
      }
      
    } else if( isJumbo ){
      
      this.selectTab( this.get('lastTab'), this.get('lastTabType'), true, menuOpenedOnThisClick );
      
    } else if( this.get('lastMenu') ){
      
      this.selectTab( this.get('lastMenu'), 'menu', true, menuOpenedOnThisClick );
      
    } else {
      
      let path = window.location.pathname;
      let selectMenu;
      let bestMatch = 0;
      
      $.each(MenuData.menus, (menu, items)=>{

        $.each(items, (index, item)=>{
          
          let matched = Ember.Blackout.matchPathToMenuItem(path,item.route);
          
          if(matched > bestMatch){
            selectMenu = menu;
            bestMatch = matched;
          }

        });
      });
      
      if (selectMenu) {
        this.selectTab(selectMenu, 'menu', true, menuOpenedOnThisClick );
      } else {
        this.selectTab('manager', 'menu', true, menuOpenedOnThisClick );
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
    
    // Serialize for CSS
    selectPath = selectPath.replace(/\./g,'_');
    
    // tmp
    if(selectPath==='coming-soon'){
      return;
    }
    
    // Only select a new menu link if it's not empty (otherwise it breaks home page scroll-to links)
    if(! Ember.isEmpty(selectPath) ){
      
      //log('deselecting all menu links');
      
      $('#nav-panel a.menu-link').removeClass('selected');
      //$('a.menu-link[href="/'+selectPath+'"]').addClass('selected');
      
      let $matchedMenu = Ember.Blackout.findPathInMenu(selectPath);
      
      //log('selecting menu link ('+selectPath+')');
      if($matchedMenu.length){
        $matchedMenu.addClass('selected');
      } else {
        $('#menuItem_'+selectPath).addClass('selected');
      }
      
    }
    
  },

  updateTopBar() {

    if (!this.get('touching')) {
      //print('prevent');
      return;
    }

    var ogScrollTop = this.get('ogScrollTop');
    var ogBarTop = this.get('ogBarTop');
    var newTop = $('#nav-body')[0].scrollTop;

    var newHeight = Math.min(this.get('topBarHeight'), Math.max(22, (ogBarTop + this.get('topBarHeight')) + (ogScrollTop - newTop)));

    $('#nav-topbar').css('top', (newHeight - this.get('topBarHeight') + 'px'));
    
    $('.loading-slider').css('top',newHeight + 'px');

    // Update visibility of bar content
    var collapse = (this.get('topBarHeight') - newHeight) / (this.get('topBarHeight') - 22);
    $('#nav-topbar-content').css('opacity', 1 - Math.min(1, collapse * 1.33));

    this.set('topBarCollapseAmount', collapse);

    var prevTop = this.get('prevTop');
    var prevDirection = this.get('prevDirection');
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
        this.set('ogScrollTop', $('#nav-body')[0].scrollTop);
        this.set('ogBarTop', parseInt($('#nav-topbar').css('top')));

      }

      this.set('prevTop', newTop);
      this.set('prevDirection', direction);

    }

  },

  preventBodyScroll() {
    // No longer needed after creation of prevent body scroll mixin
    this.bodyScrollPreventer = function(/*e*/) {
      //e.preventDefault();
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
    settingsPanelToggled(showing){
      this.set('settingsPanelIsShowing',showing);
      if(showing){
        this.show();
        this.selectTab('settings','misc');
      } else {
        this.selectCurrentMenu();
      }
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
      if(type!=='misc'){
        this.deselectMisc();
      }
      newButton.addClass('selected');
      
      // Munges
      if(type==='menu' && tabName==='info'){
        // For showing info tab on left in home page menu on mobile
        type = 'tab';
      }
      
      if( tabName === 'settings' ){
        
        if( this.get('lastMenu') !== 'settings' ){
          this.set('lastMenuBeforeSettings',this.get('lastMenu'));
        }
        this.set('lastMenu',tabName);
        
      } else if( type === 'menu' ){
        
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
        this.set('tabSwitcherSelected', 'gameNav-' + tabName + 'Panel' );
      } else {
        
        // Select menu tab
        if(!menuOpenedOnThisClick){
          this.set('tabSwitcherDirection','right');
        } else {
          this.set('tabSwitcherDirection','immediate');
        }
        this.set('tabSwitcherSelected','gameNav-menuPanel');
        
        // Select menu
        if( this.get('lastTabSelected') !== 'menu' ){
          this.set('menuSwitcherDirection','immediate');
        } else {
          this.set('menuSwitcherDirection',direction);
        }
        
        this.set('menuSwitcherSelected','gameNav-'+tabName+'Panel');
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
      
      //$('#sidebar-scroller')[0].scrollTop = 0;
      Ember.run.next(function(){
        //$('#sidebar-scroller').perfectScrollbar('update');
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
    
    Ember.run.next(()=>{
      Ember.$(this.get('disableClassSelector')).removeClass('resizing');
    });
  },
  
  /**
   * Only when tab bar is at the bottom of the screen do these functions apply, i.e. mobile only
   */
  hideBottomTabBar() {
    $('#nav-tabbar').addClass('hidden-xs');
    $(this.get('disableBottomClassSelector')).addClass('bottom-nav-disabled');
    this.get('eventBus').publish('fixedItemsShift');
    this.set('bottomTabBarIsShowing',false);
    $('#nav-body-inner').addClass('full-body');
    this.updateSidebarScrollerHeight();
  },
  showBottomTabBar() {
    $('#nav-tabbar').removeClass('hidden-xs');
    $(this.get('disableBottomClassSelector')).removeClass('bottom-nav-disabled');
    this.get('eventBus').publish('fixedItemsShift');
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
      //$('#sidebar-scroller').animate({ scrollTop: 0 }, 400, 'easeOutExpo').off('touchstart wheel',handleScrollStop).on('touchstart wheel',handleScrollStop);
    }
  
  },
  
  /**
   * Callback after menu is switched
   */
  
  updateMenuScrollArea(){
    
    //$('#sidebar-scroller').perfectScrollbar('update');
    
  },
  
  usePerfectScroll: Ember.computed(function(){
    //return window.browsers.webkit;
    return !window.os.touchOS;
  }),

});
