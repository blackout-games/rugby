import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['button','no-webkit-highlight'],
  attributeBindings: ['aria-label','aria-hidden'],
  setup: Ember.on('didInsertElement', function(){
    
    // This fixes a bug where the bottom tabs can receive touchstart events in upper areas of the page when scrolling about.
    if( this.get('applyFixedPositionTouchFix') ){
      
      var isFixed = this.$().parents().filter(function() {
        return $(this).css('position') === 'fixed';
      }).length;
      
      if(isFixed){
        this.updateFixedY();
        this.resizeHandlerBound = Ember.run.bind(this,this.resizeHandler);
        Ember.$(window).on('resize', this.resizeHandlerBound);
      }
      
    }
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    if(this.resizeHandlerBound){
      Ember.$(window).off('resize', this.resizeHandlerBound);
      this.resizeHandlerBound = null;
    }
  }),
  
  resizeHandler(){
    Ember.run.debounce(this, this.updateFixedY, 222);
  },
  
  updateFixedY(){
    var offset = this.$().offsetWindow();
    this.set('fixedY',offset.top);
  },
  
  mouseDown(e) {
    this.runAction(e);
  },
  touchStart(e) {
    this.runAction(e);
  },
  runAction(e) {
    
    // Only run on this type of event
    if( !this.get('firstevent') ){
      this.set('firstevent',e.type);
    }
    
    if( this.get('firstevent') === e.type ) {
      
      if( e.type === 'touchstart' && this.get('fixedY') && this.get('fixedY') > e.originalEvent.changedTouches[0].clientY ){
        
        e.preventDefault();
        e.stopPropagation();
        return false;
        
      }
      
      // Sends default action
      this.sendAction(undefined,this,e);
      
    }
    
  },
  
  
});
