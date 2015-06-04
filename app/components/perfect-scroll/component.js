import Ember from 'ember';

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

  renderPerfectScroll: function() {
    var self = this;
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
    
    Ember.$(window).on('resize', Ember.run.bind(this, this.updatePerfectScroll));
  }.on('didInsertElement'),
  
  cleanPerfectScroll: function(){
    Ember.$(window).off('resize', Ember.run.bind(this, this.updatePerfectScroll));
  }.on('willDestroyElement'),
  
  updatePerfectScroll: function(){
    // Update on resize
    this.$().perfectScrollbar('update');
  }
});
