import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  classNames: ['landscape-preventer'],
  
  preventerShowing: false,

  watchUI: function(){
    
    this.onResizeBound = Ember.run.bind( this, this.onResize );
    $(window).on('resize', this.onResizeBound);
    
    this.onResize();
    
  }.on('didInsertElement'),
  
  onResize: function(){
    
    var preventerShowing = this.get('preventerShowing');
    var textsWithFocus = $('input[type=text]:focus,input[type=password]:focus,textarea:focus').length;
    
    // Detect landscape on mobile, and show preventer
    if(this.get('media.isMobile') && textsWithFocus===0){
      
      var viewportWidth = $(window).width();
      var viewportHeight = $(window).height();
      
      if( viewportHeight < viewportWidth ){
        if( !preventerShowing ){
          $('.landscape-preventer').show();
          this.set('preventerShowing',true);
        }
      } else if(preventerShowing){
        $('.landscape-preventer').hide();
        this.set('preventerShowing',false);
      }
      
    } else if(preventerShowing) {
      $('.landscape-preventer').hide();
      this.set('preventerShowing',false);
    }
    
  },
  
});
