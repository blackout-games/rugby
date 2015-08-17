import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  testingSidebar: false,
  navMinWait: 222,
  navLastAction: 0,
  navIsOpen: false,
  selector: '',

  startListening: function() {
    
    this.get('EventBus').subscribe('showNav', this, this.show);
    this.get('EventBus').subscribe('hideNav', this, this.hide);

  }.on('didInsertElement'),

  stopListening: function() {

    this.get('EventBus').unsubscribe('showNav', this, this.show);
    this.get('EventBus').unsubscribe('hideNav', this, this.hide);

  }.on('willDestroyElement'),

  setup: function() {

    // For testing
    if (this.get('testingSidebar')) {
      this.send('show');
    }

    this.handleResizeBound = Ember.run.bind(this, this.handleResize);
    Ember.$(window).on('resize', this.handleResizeBound);
    
    // Bound functions
    this.hideBound = Ember.run.bind(this, this.hide);
    this.bodyTouchBound = Ember.run.bind(this, this.bodyTouch);

  }.on('didInsertElement'),
  
  bodyTouch: function(){
    
    if( !this.get('media.isJumbo') ){
      this.hideBound();
    }
    
  },

  openSidebarOnChange: function() {
    if (this.get('testingSidebar')) {
      this.send('show');
    } else {
      this.send('hide');
    }
  }.observes('media.tablet'),

  clean: function() {

    if (this.handleResizeBound) {
      Ember.$(window).off('resize', this.handleResizeBound);
    }

  }.on('willDestroyElement'),

  handleResize: function() {
    $(this.get('selector')).addClass('resizing');
    Ember.run.debounce(this, this.cleanResize, 200);
  },
  cleanResize: function() {
    $(this.get('selector')).removeClass('resizing');
  },

  smallMode: function() {
    return Ember.Blackout.isSmallMode(this);
  }.property('media.isMobile'),

  actions: {
    toggle: function() {

      if (this.get('navIsOpen')) {
        this.send('hide');
      } else {
        this.send('show');
      }

    },
    show: function() {
      this.show();
    },
    hide: function() {
      this.hide();
    }
  },

  show: function() {

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
  hide: function() {
    
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
