import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['button'],
  attributeBindings: ['aria-label'],
  mouseDown: function(e){
    this.runAction(e);
  },
  touchStart: function(e){
    this.runAction(e);
  },
  runAction: function(e){
    
    // Only run on this type of event
    if( !this.get('firstevent') ){
      this.set('firstevent',e.type);
    }
    
    if( this.get('firstevent') === e.type ) {
      this.sendAction(undefined,this.$(),e);
    }
    
  }
});
