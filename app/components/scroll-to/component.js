import Ember from 'ember';
var $ = Ember.$;

var DURATION = 555;
var EASING = 'easeOutExpo';
//var EASING = 'easeInOutCubic';

export default Ember.Component.extend({
  tagName: 'a',
  href: null,
  duration: DURATION,
  easing: EASING,
  attributeBindings: ['href'],
  closeMenu: false,
  delayClose: 0,
  scrollOn: 'click',
  
  setupEvent: function(){
    
    this.$().on(this.get('scrollOn'),Ember.run.bind(this,this.scroll));
    
  }.on('didInsertElement'),

  scrollable: function() {
    if(window.features.lockBody){
      return Ember.$('#body');
    } else {
      return Ember.$('html, body');
    }
  }.property('window.features.lockBody'),

  getTarget: function() {
    var maxScroll = this.get('scrollable')[0].scrollHeight - $(window).height();
    
    var target;
    if( window.features.lockBody){
      target = Ember.$(this.get('href')).position().top + this.get('scrollable').scrollTop();
    } else {
      target = Ember.$(this.get('href')).offset().top;
    }
    
    return Math.min(target,maxScroll);
  },

  scroll: function(e) {
    
    e.preventDefault();
    e.stopPropagation();
    
    var self = this;
    
    this.updateHashQuietly( this.get('href').substr(1) );
    
    var newTarget = this.getTarget();
    var currentScrollTop = window.features.lockBody ? Ember.$('#body').scrollTop() : (Ember.$('html').scrollTop() || Ember.$('body').scrollTop());
    var scrollDistance = Math.abs(currentScrollTop-newTarget);
    
    if( this.get('closeMenu') ){
      if(scrollDistance > Ember.$(window).height()*0.33){
        Ember.$('#body,#sidebar,#backboard').addClass('slow-transition');
      }
      this.get('EventBus').publish('hideNav');
    }
    
    this.get('scrollable').animate({
      scrollTop: newTarget + 'px'
    }, this.get('duration'), this.get('easing'), function(){
      if( self.get('closeMenu') ){
        Ember.$('#body,#sidebar,#backboard').removeClass('slow-transition');
      }
    });
    
  },
  
  /**
   * Updates the URL hash without triggering scroll
   * @param  {string} hash The new hash
   * @return {null}      
   */
  updateHashQuietly ( hash ) {
    
    hash = hash.replace( /^#/, '' );
    var fx, node = $( '#' + hash );
    if ( node.length ) {
      node.attr( 'id', '' );
      fx = $( '<div></div>' )
              .css({
                  position:'absolute',
                  visibility:'hidden',
                  top: $(document).scrollTop() + 'px'
              })
              .attr( 'id', hash )
              .appendTo( document.body );
    }
    document.location.hash = hash;
    if ( node.length ) {
      fx.remove();
      node.attr( 'id', hash );
    }
    
  },
  
  handleClick: function(e){
    if( this.get('scrollOn') !== 'click' ){
      e.preventDefault();
      e.stopPropagation();
    }
  }.on('click'),
  
});
