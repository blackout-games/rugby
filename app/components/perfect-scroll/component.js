import Ember from 'ember';
//const { $ } = Ember;

/**
 * Doesn't play well with fastclick
 * But when attempting to implement default browser powered div scrolling on mobile, nothing worked quite as well as perfect scroll.
 * Even with best solution getting event propagation prevention to work, it doesn't feel natural when scrolling at the bottom and the reversing to scroll back up.
 * You have to take your finger off the screen then start again.
 * Plus occasionally it would lock up completely.
 */

export default Ember.Component.extend({
  wheelSpeed: 1,
  wheelPropagation: false,
  swipePropagation: false,
  minScrollbarLength: null,
  maxScrollbarLength: null,
  useBothWheelAxes: false,
  useKeyboard: true,
  suppressScrollX: false,
  suppressScrollY: false,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  includePadding: false,
  allowScrollEvent: false,

  renderPerfectScroll: Ember.on('didInsertElement', function() {
    var self = this;

    // Don't do this on iOS, because there perfect scrollbar doesn't play well with fastclick
    if (window.features.canPerfectScroll || true) {
      this.$().perfectScrollbar({
        wheelSpeed: self.get('wheelSpeed'),
        wheelPropagation: self.get('wheelPropagation'),
        swipePropagation: self.get('swipePropagation'),
        minScrollbarLength: self.get('minScrollbarLength'),
        maxScrollbarLength: self.get('maxScrollbarLength'),
        useBothWheelAxes: self.get('useBothWheelAxes'),
        useKeyboard: self.get('useKeyboard'),
        suppressScrollX: self.get('suppressScrollX'),
        suppressScrollY: self.get('suppressScrollY'),
        scrollXMarginOffset: self.get('scrollXMarginOffset'),
        scrollYMarginOffset: self.get('scrollYMarginOffset'),
        includePadding: self.get('includePadding')
      });

      this.updatePerfectScrollBound = Ember.run.bind(this, this.updatePerfectScroll);
      Ember.$(window).on('resize', this.updatePerfectScrollBound);

      // Added this as a band-aid fix. updatePerfectScroll was unable to see this.$() after changing routes...
      this.set('scrollElementId', '#' + this.$().attr('id'));

      // Run an update now for height
      Ember.run.next(this, this.updatePerfectScroll);

    } else {

      this.$().addClass("perfect-scrollbar-default");
      this.startPreventingBodyScroll();

      if (this.get('allowBodyScrollEvent')) {
        this.changeAllowBodyScrollBound = Ember.run.bind(this, this.changeAllowBodyScroll);
        this.get('EventBus').subscribe(this.get('allowBodyScrollEvent'), this.changeAllowBodyScrollBound);
      }

    }

  }),

  updateClickWatcher: Ember.on('didRender', function() {

    this.$().off('touchstart', this.trackTouchStart);
    this.$().on('touchstart', null, this, this.trackTouchStart);
    this.$().off('touchend', this.checkForClick);
    this.$().on('touchend', null, this, this.checkForClick);

  }),

  trackTouchStart(e) {
    
    var self = e.data;
    var touch = e.originalEvent.changedTouches[0];
    
    self.set('scrollStart', self.$()[0].scrollTop);
    self.set('scrollStartTouchX', touch.clientX);
    self.set('scrollStartTouchY', touch.clientY);

  },

  checkForClick(e) {

    var self = e.data;
    
    // Make sure touch is still on the same element
    let startTouchX = self.get('scrollStartTouchX');
    let startTouchY = self.get('scrollStartTouchY');
    let touch = e.originalEvent.changedTouches[0];
    let movementThreshold = 11;
    
    // elementFromPoint is too unreliable on fixed elements.
    // So we just monitor if the finger has moved too much.
    //var newTarget = document.elementFromPoint(touch.pageX, touch.pageY);
    //if(e.target === newTarget){
    if(Math.abs(touch.clientX - startTouchX) <= movementThreshold 
      && Math.abs(touch.clientY - startTouchY) <= movementThreshold){
    
      // Make sure scroll position hasn't changed
      
      if (self.$()[0].scrollTop === self.get('scrollStart')) {
        
        Ember.$(e.target).trigger('click');
        e.preventDefault();
      }
    }

  },

  changeAllowBodyScroll(canBodyScroll) {

    if (canBodyScroll) {
      this.stopPreventingBodyScroll();
    } else {
      this.startPreventingBodyScroll();
    }
  },

  startPreventingBodyScroll() {

    // Prevent scrolling of body
    Ember.$('#sidebar-body').on('touchstart', this.handleTouchStart);
    Ember.$('#sidebar-body').on('touchmove', this.handleTouchMove);

    if (this.get('suppressScrollX')) {
      Ember.$('#sidebar-body').css('overflow-y', 'scroll');
    } else if (this.get('suppressScrollY')) {
      Ember.$('#sidebar-body').css('overflow-x', 'scroll');
    } else {
      Ember.$('#sidebar-body').css('overflow', 'scroll');
    }

  },

  stopPreventingBodyScroll() {

    // Prevent scrolling of body
    Ember.$('#sidebar-body').off('touchstart', this.handleTouchStart);
    Ember.$('#sidebar-body').off('touchmove', this.handleTouchMove);

    if (this.get('suppressScrollX')) {
      Ember.$('#sidebar-body').css('overflow-y', 'hidden');
    } else if (this.get('suppressScrollY')) {
      Ember.$('#sidebar-body').css('overflow-x', 'hidden');
    } else {
      Ember.$('#sidebar-body').css('overflow', 'hidden');
    }
    Ember.$(document).off('touchmove', this.prevDef);

  },

  handleTouchStart(e) {
    
    this.allowUp = (this.scrollTop > 0);
    this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
    this.prevTop = null;
    this.prevBot = null;
    this.lastY = e.originalEvent.touches[0].pageY;

  },

  handleTouchMove(e) {


    var pageY = e.originalEvent.touches[0].pageY;
    if (!this.lastY) {
      this.lastY = pageY;
    }
    var up = (pageY > this.lastY),
      down = !up;
    if ((this.lastDirectionUp && !up) || (!this.lastDirectionUp && up)) {
      Ember.$(e.target).trigger('touchstart');
    }
    this.lastY = pageY;
    this.lastDirectionUp = up;
    if ((up && this.allowUp) || (down && this.allowDown)) {
      e.stopPropagation();
    } else {
      e.preventDefault();
    }

  },

  cleanPerfectScroll: Ember.on('willDestroyElement', function() {

    if (this.updatePerfectScrollBound) {
      Ember.$(window).off('resize', this.updatePerfectScrollBound);
    }

    Ember.$(this.get('scrollElementId')).perfectScrollbar('destroy');

  }),

  updatePerfectScroll() {
    
    // Update on resize
    if (Ember.$(this.get('scrollElementId')).perfectScrollbar) {

      // Udpate height
      Ember.$(this.get('scrollElementId')).height(Ember.$(this.get('scrollElementId')).parent().height());

      // Run update on perfect scrollbar
      Ember.$(this.get('scrollElementId')).perfectScrollbar('update');

    }
  }
});
