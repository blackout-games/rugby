import Ember from 'ember';
import ResponsiveNav from '../responsive-nav/component';
import MenuData from '../../utils/menu';
var $ = Ember.$;

export default ResponsiveNav.extend({
  testSidebar: false,
  
  // Settings
  
  selector: '#nav-sidebar,#nav-panel,#nav-body,#nav-touch-blocker,#nav-topbar',
  disableHideSelector: '#nav-tabbar,#tabbar-balloon,#nav-sidebar,#nav-panel,#nav-touch-blocker',
  disableClassSelector: 'body,#nav-body',
  topBarHeight: 59,
  topBarBuffer: 100,
  menuLabelLarge: 'Menu',
  
  // Variables
  
  topBarIsShowing: true,
  topBarCollapseAmount: 0,
  tabSwitcherDirection: 'immediate',
  tabSwitcherSelected: 'menuPanel',
  menuSwitcherDirection: 'immediate',
  menuSwitcherSelected: 'managerPanel',
  

  uiEvents: [
    /*
    {
      eventName: 'resize',
      callbackName: 'updateMenuHeight',
      selector: window,
    }
    */
  ],

  startListening: function() {
    
    this._super.apply(this, arguments);
    this.get('EventBus').subscribe('disableGameNav', this, this.disable);
    this.get('EventBus').subscribe('enableGameNav', this, this.enable);
    this.get('EventBus').subscribe('selectMenuLink', this, this.selectMenuLink);

  }.on('init','didInsertElement'),

  stopListening: function() {
    
    this._super.apply(this, arguments);
    this.get('EventBus').unsubscribe('disableGameNav', this, this.disable);
    this.get('EventBus').unsubscribe('enableGameNav', this, this.enable);
    this.get('EventBus').unsubscribe('selectMenuLink', this, this.selectMenuLink);

  }.on('willDestroyElement'),

  setup: function() {
    this._super();

    var self = this;
    
    // Lock body on landscape tablets
    if( !window.features.lockBody && (this.get('media.isTablet') || this.get('media.isDesktop')) && ( window.os.iOS || window.os.android ) ){
      window.features.lockBody = true;
    }

    if (window.features.lockBody) {
      $('html,body,#nav-body').addClass('fixed');

      // Touch start
      this.touchStartHandler = function(e) {
        self.set('lastY', e.originalEvent.changedTouches[0].pageY);
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
    if (window.navigator.standalone) {
      
      // Show topbar
      $('.nav-topbar').removeClass('hidden');
      $('.nav-status-balloon').removeClass('hidden');
      
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

          // Update balloons
          $('.nav-status-balloon-flex').animate({
            'height': '22px'
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

          // Update balloons
          $('.nav-status-balloon-flex').animate({
            'height': self.get('topBarHeight')
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
    
    this.autoShowOnLarge();
    this.updateUIOnLandscapeTablet();
    this.createMenus();
    this.selectCurrentMenu();

    // For testing
    if (this.get('testSidebar')) {
      this.send('show');
    }

  }.on('didInsertElement'),

  clean: function() {
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

  }.on('willDestroyElement'),
  
  autoShowOnLarge: function() {
    
    if( this.get('media.isJumbo') ){
      this.show();
      this.selectCurrentMenu();
      this.set('menuLabelLarge','Hide');
    } else {
      this.hide();
    }
    
  }.observes('media.isJumbo'),
  
  updateUIOnLandscapeTablet: function() {
    
    // Different sidebar spacing for standalone
    if( this.get('media.isDesktop') && window.navigator.standalone ){
      $('#nav-sidebar').addClass('col-8');
      $('#nav-tabbar').addClass('col-4');
    } else {
      $('#nav-sidebar').removeClass('col-8');
      $('#nav-tabbar').removeClass('col-4');
    }
    
  }.observes('media.isDesktop'), // isDesktop = landscape tablet
  
  createMenus (){
    
    var self = this;
    
    $.each(MenuData.menus, function( menuName, menuItems ){
      $.each(menuItems,function( index, item ){
        
        var realRoute;
        
        if(item.tempRoute){
          var itemLink = $('<a href="/'+item.tempRoute+'" id="menuItem'+item.route+'" class="btn-a menu-link">'+item.label+'</a>');
          var action = 'transitionAction';
          realRoute = item.tempRoute;
        } else if(item.route){
          var itemLink = $('<a href="/'+item.route+'" id="menuItem'+item.route+'" class="btn-a menu-link">'+item.label+'</a>');
          var action = 'transitionAction';
          realRoute = item.route;
        } else if(item.action) {
          var itemLink = $('<a class="btn-a menu-link">'+item.label+'</a>');
          var action = 'menuAction';
          self.set('menuAction',item.action);
        }
        
        if(itemLink){
          itemLink.on('click',function(e){
            e.preventDefault();
            self.sendAction(action,realRoute);
            self.selectMenuLink(item.route);
            return false;
          });
          $('#'+menuName+'Panel').append(itemLink);
        }
        
      });
    });
    
  },

  selectCurrentMenu () {
    
    var self = this;
    
    if( self.get('media.isJumbo') && self.get('lastTab') ){
      
      self.selectTab( self.get('lastTab'), self.get('lastTabType'), true );
      
    } else if( self.get('lastMenu') ){
      
      self.selectTab( self.get('lastMenu'), 'menu', true );
      
    } else {
      
      var path = window.location.pathname;
      var selected = false;
      
      $.each(MenuData.menus, function(menu, items) {

        $.each(items, function(index, item) {

          if ('/'+item.route === path) {
            self.selectTab(menu, 'menu', true);
            selected = true;
            return false;
          }

        });
      });
      
      if(!selected){
        self.selectTab('manager', 'menu', true);
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
    
    $('a.menu-link').removeClass('selected');
    //$('a.menu-link[href="/'+selectPath+'"]').addClass('selected');
    $('#menuItem'+selectPath).addClass('selected');
    
  },

  updateTopBar: function() {

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

    // Update balloons
    $('.nav-status-balloon-flex').css('height', newHeight);

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

  preventBodyScroll: function() {
    this.bodyScrollPreventer = function(e) {
      e.preventDefault();
    };
    $('#nav-sidebar,#nav-panel').on('touchstart touchmove', this.bodyScrollPreventer);
  },

  allowBodyScroll: function() {
    $('#nav-sidebar,#nav-panel').off('touchstart touchmove', this.bodyScrollPreventer);
  },

  transitionAction: 'transitionToRoute',
  fbLoginAction: 'loginWithFacebook',
  logoutAction: 'invalidateSession',
  
  actions: {
    clickTab: function(button) {
      this.selectTab(button.get('tabName'), 'tab');
    },
    clickMenu: function(button) {
      this.selectTab(button.get('menuName'), 'menu');
    },
    invalidateSession: function(){
      this.sendAction('logoutAction');
    },
    loginWithFacebook: function(button){
      this.sendAction('fbLoginAction',button);
    },
  },

  selectTab: function(tabName, type, programatic) {
    
    // Don't select tab if menu panel is not showing
    if( programatic && !this.get('navIsOpen') ){
      return;
    }

    var tab = $('.nav-' + type + '-' + tabName);
    if (tab.hasClass('selected') || tab.hasClass('nav-close')) {
      
      if( !this.get('media.isJumbo') ){
        
        this.hide();
        
      } else if (tab.hasClass('nav-close') ){
        
        // Close menu on large
        $('#nav-panel,#nav-body').addClass('force-transition');
        if( this.hide() ){
          this.set('menuLabelLarge','Menu');
        }
        
      }

    } else if( tabName === 'menu' ) {
      
      this.show();
      this.selectCurrentMenu();
      this.set('menuLabelLarge','Hide');
      
    } else {
      
      var menuOpened = this.show();
      
      var newButton = $('.nav-' + type + '-' + tabName);
      $('.nav-tab-btn,.nav-menu-btn').removeClass('selected');
      newButton.addClass('selected');
      
      if( type === 'menu' ){
        
        this.set('lastMenu',tabName);
        
      } else {
        
        this.set('lastMenu',null);
        
      }
      
      // Determine direction
      var direction = 'immediate';
      var lastTab = this.get('lastTab');
      
      if(!menuOpened){
        
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
        if(!menuOpened){
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

  deselectAllTabs: function() {
    $('.nav-tab-btn,.nav-menu-btn').removeClass('selected');
  },

  show: function() {
    
    if (this._super()) {
      
      if( !$('.nav-tab-btn,.nav-menu-btn').hasClass('selected') ){
        this.selectCurrentMenu();
      }
      
      $('.nav-burger,.nav-tab-menu').addClass('nav-close');

      $('#nav-touch-blocker').on('mousedown touchstart', this.bodyTouchBound);

      this.preventBodyScroll();

      if (this.hideTopBar && this.get('media.isMobile')) {
        var wasShowing = this.hideTopBar(true);
        this.set('topbarWasShowing',wasShowing);
      }

      return true;
    }
  },

  hide: function() {
    if (this._super()) {
      
      this.deselectAllTabs();
      $('.nav-burger,.nav-tab-menu').removeClass('nav-close');

      this.allowBodyScroll();

      $('#nav-touch-blocker').off('mousedown touchstart', this.bodyTouchBound);
      
      if (this.get('topbarWasShowing')) {
        this.showTopBar(true);
      }

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

});
