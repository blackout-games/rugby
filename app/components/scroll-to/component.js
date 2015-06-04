import Ember from 'ember';
var $ = Ember.$;

var DURATION = 555;
var EASING = 'easeOutExpo';

export default Ember.Component.extend({
  tagName: 'a',
  href: null,
  duration: DURATION,
  easing: EASING,
  attributeBindings: ['href'],
  
  setupEvent: function(){
    if( this.get('scroll-on') ){
      this.$().on(this.get('scroll-on'),Ember.run.bind(this,this.scroll));
    } else {
      this.$().on('click',Ember.run.bind(this,this.scroll));
    }
    
  }.on('didInsertElement'),

  scrollable: function() {
    if(window.features.lockBody){
      return Ember.$('#body');
    } else {
      return Ember.$('html, body');
    }
  }.property(),

  target: function() {
    var maxScroll = this.get('scrollable')[0].scrollHeight - $(window).height();
    return Math.min(Ember.$(this.get('href')).position().top + this.get('scrollable').scrollTop(),maxScroll);
  }.property('href'),

  scroll: function(e) {
    
    e.preventDefault();
    e.stopPropagation();
    
    this.updateHashQuietly( this.get('href').substr(1) );
    this.get('scrollable').animate({
      scrollTop: this.get('target')
    }, this.get('duration'), this.get('easing'));
    
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
  
});
