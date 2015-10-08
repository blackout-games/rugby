import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  testingSidebar: false,
  navMinWait: 222,
  navLastAction: 0,
  navIsOpen: false,
  selector: '',

  startListening: Ember.on('didInsertElement', function() {
    
    this.get('EventBus').subscribe('showNav', this, this.show);
    this.get('EventBus').subscribe('hideNav', this, this.hide);

  }),

  stopListening: Ember.on('willDestroyElement', function() {

    this.get('EventBus').unsubscribe('showNav', this, this.show);
    this.get('EventBus').unsubscribe('hideNav', this, this.hide);

  }),

  setup: Ember.on('didInsertElement', function() {

    // For testing
    if (this.get('testingSidebar')) {
      this.send('show');
    }

    this.handleResizeBound = Ember.run.bind(this, this.handleResize);
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

  handleResize() {
    $(this.get('selector')).addClass('resizing');
    Ember.run.debounce(this, this.cleanResize, 200);
  },
  cleanResize() {
    $(this.get('selector')).removeClass('resizing');
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

      this.get('EventBus').publish("navAllowBodyScroll", false);

      $(this.get('selector')).addClass('open');
      $('#nav-body').on('mousedown touchstart', this.bodyTouchBound);
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

      this.get('EventBus').publish("navAllowBodyScroll", true);

      $(this.get('selector')).removeClass('open');
      $('#nav-body').off('mousedown touchstart', this.bodyTouchBound);
      this.set('navLastAction', now);
      this.set('navIsOpen', false);
      
      return true;
    }

  },


});
