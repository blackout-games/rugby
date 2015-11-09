import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['button'],
  attributeBindings: ['aria-label'],
  setup: Ember.on('didInsertElement', function(){
    
    // This fixes a bug where the bottom tabs can receive touchstart events in upper areas of the page when scrolling about.
    if( this.get('applyFixedPositionTouchFix') ){
      
      var isFixed = this.$().parents().filter(function() {
        return $(this).css('position') == 'fixed';
      }).length;
      
      if(isFixed){
        var offset = this.$().offset();
        var posY = offset.top - Ember.$(window).scrollTop();
        this.set('fixedY',posY);
      }
      
    }
    
  }),
  
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
