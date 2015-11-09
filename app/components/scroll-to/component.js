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
  
  setupEvent: Ember.on('didInsertElement', function(){
    
    this.scrollBound = Ember.run.bind(this,this.scroll);
    this.$().on(this.get('scrollOn'),this.scrollBound);
    
  }),
  
  cleanup: Ember.on('willDestroyElement', function(){
    
    if(this.scrollBound){
      this.$().off(this.get('scrollOn'),this.scrollBound);
    }
    
  }),

  scrollable: Ember.computed('window.features.lockBody', function() {
    if(window.features.lockBody){
      return Ember.$('#nav-body');
    } else {
      return Ember.$('html, body');
    }
  }),

  getTarget() {
    var maxScroll = this.get('scrollable')[0].scrollHeight - $(window).height();
    
    var target;
    if( window.features.lockBody){
      target = Ember.$(this.get('linkId')).position().top + this.get('scrollable').scrollTop();
    } else {
      target = Ember.$(this.get('linkId')).offset().top;
    }
    
    return Math.min(target,maxScroll);
  },
  
  scroll(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var self = this;
    
    // Check for url
    let href = this.get('href');
    let parts = href.split('#');
    let linkId = href;
    
    if(parts.length>1 && !Ember.isEmpty(parts[0])){
      
      // Get current route
      let currentPath = window.location.pathname;
      
      // Get target route
      let targetPath = parts[0];
      
      // Get hash
      linkId = '#' + parts[1];
      
      // If route is different
      if(targetPath!==currentPath){
        
        let routeCheck = function(){
          if(window.location.pathname==targetPath){
            Ember.run.later(function(){
              window.location.hash = linkId;
            },100);
          } else {
            Ember.run.next(routeCheck);
          }
        };
      
        // Go to route
        this.get('router').transitionTo(targetPath);
        Ember.run.next(routeCheck);
        
        return;
        
      }
      
    }
    
    this.set('linkId',linkId);
    
    // This should be done via waypoints
    //this.updateHashQuietly( linkId.substr(1) );
    
    var newTarget = this.getTarget();
    var currentScrollTop = window.features.lockBody ? Ember.$('#nav-body').scrollTop() : (Ember.$('html').scrollTop() || Ember.$('body').scrollTop());
    var scrollDistance = Math.abs(currentScrollTop-newTarget);
    
    if( this.get('closeMenu') ){
      if(scrollDistance > Ember.$(window).height()*0.33){
        Ember.$('#nav-body,#sidebar,#backboard').addClass('slow-transition');
      }
      this.get('EventBus').publish('hideNav');
    }
    
    this.get('scrollable').animate({
      scrollTop: newTarget + 'px'
    }, this.get('duration'), this.get('easing'), function(){
      if( self.get('closeMenu') ){
        Ember.$('#nav-body,#sidebar,#backboard').removeClass('slow-transition');
      }
    });
    
  },
  
  handleClick: Ember.on('click', function(e){
    if( this.get('scrollOn') !== 'click' ){
      e.preventDefault();
      e.stopPropagation();
    }
  }),
  
});
