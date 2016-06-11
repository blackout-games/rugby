import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  testingSidebar: false,
  navMinWait: 222,
  navLastAction: 0,
  navIsOpen: false,
  selector: '',
  resizingSelector: '',

  startListening: Ember.on('didInsertElement', function() {
    
    this.get('eventBus').subscribe('showNav', this, this.show);
    this.get('eventBus').subscribe('hideNav', this, this.hide);

  }),

  stopListening: Ember.on('willDestroyElement', function() {

    this.get('eventBus').unsubscribe('showNav', this, this.show);
    this.get('eventBus').unsubscribe('hideNav', this, this.hide);

  }),

  setup: Ember.on('didInsertElement', function() {

    // For testing
    if (this.get('testingSidebar')) {
      this.send('show');
    }

    this.handleResizeBound = Ember.run.bind(this, this.handleResizeResponsive);
    Ember.$(window).on('resize', this.handleResizeBound);
    
    // Bound functions
    this.hideBound = Ember.run.bind(this, this.hide);
    this.bodyTouchBound = Ember.run.bind(this, this.bodyTouch);

  }),
  
  bodyTouch() {
    
    if( !this.get('media.isJumbo') ){
      this.hideBound();
    }
    
  },
  
  /**
   * No way to not use an observer here
   */
  openSidebarOnChange: Ember.observer('media.tablet', function() {
    if (this.get('testingSidebar')) {
      this.send('show');
    } else {
      this.send('hide');
    }
  }),

  clean: Ember.on('willDestroyElement', function() {

    if (this.handleResizeBound) {
      Ember.$(window).off('resize', this.handleResizeBound);
    }

  }),

  handleResizeResponsive() {
    $(this.get('resizingSelector')).addClass('resizing');
    Ember.run.debounce(this, this.cleanResizeResponsive, 200);
  },
  cleanResizeResponsive() {
    $(this.get('resizingSelector')).removeClass('resizing');
  },

  smallMode: Ember.computed('media.isMobile', function() {
    return Ember.Blackout.isSmallMode(this);
  }),

  actions: {
    toggle() {

      if (this.get('navIsOpen')) {
        this.send('hide');
      } else {
        this.send('show');
      }

    },
    show() {
      this.show();
    },
    hide() {
      this.hide();
    }
  },

  show() {
    var now = Date.now();
    var timeSinceLast = now - this.get('navLastAction');

    if (!this.get('navIsOpen') && timeSinceLast > this.get('navMinWait')) {

      // Was used for perfect scrollbar
      //this.get('eventBus').publish("navAllowBodyScroll", false);

      $(this.get('selector')).addClass('open');
      $('#nav-touch-blocker').on('mousedown touchstart', this.bodyTouchBound);
      this.set('navLastAction', now);
      this.set('navIsOpen', true);
      
      return true;
    } else if(this.get('navIsOpen')){
      // For switching tabs while open
      // No, don't do this.
      // Should only return true if menu was closed and is now opening. Otherwise we can't detect things like if topbar is open. If we check twice, the second time it thinks topbar is already closed, when it should be open (so it knows to open again when menu is closed)
      //return true;
    }
  },
  hide() {
    
    var now = Date.now();
    var timeSinceLast = now - this.get('navLastAction');

    if (this.get('navIsOpen') && timeSinceLast > this.get('navMinWait')) {

      // Was used for perfect scrollbar
      //this.get('eventBus').publish("navAllowBodyScroll", true);

      $(this.get('selector')).removeClass('open');
      $('#nav-touch-blocker').off('mousedown touchstart', this.bodyTouchBound);
      this.set('navLastAction', now);
      this.set('navIsOpen', false);
      
      return true;
    }

  },


});
