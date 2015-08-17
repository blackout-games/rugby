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
    
    // Detect landscape on mobile, and show preventer
    if(this.get('media.isMobile')){
      
      var viewportWidth = $(window).width();
      var viewportHeight = $(window).height();
      var preventerShowing = this.get('preventerShowing');
      
      if( viewportHeight < viewportWidth ){
        if( !preventerShowing ){
          $('.landscape-preventer').show();
          this.set('preventerShowing',true);
        }
      } else if(preventerShowing){
        $('.landscape-preventer').hide();
        this.set('preventerShowing',false);
      }
      
    }
    
  },
  
});
