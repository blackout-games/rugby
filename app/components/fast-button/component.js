import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['button'],
  mouseDown: function(){
    this.sendAction(undefined,this.$());
  },
  touchStart: function(){
    this.sendAction(undefined,this.$());
  }
});
