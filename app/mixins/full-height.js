import Ember from 'ember';

export default Ember.Mixin.create({
  
  setupComponent: function() {
    
    this.adjustFullHeight();
    
    this.adjustFullHeightBound = Ember.run.bind(this, this.adjustFullHeight);
    Ember.$(window).on('resize', this.adjustFullHeightBound);
    
  }.on('didInsertElement'),

  adjustFullHeight: function() {
    this.$().height(Ember.$(window).height());
  },


  cleanFullHeight: function() {
    if(this.adjustFullHeightBound){
      Ember.$(window).off('resize', this.adjustFullHeightBound);
    }
  }.on('willDestroyElement'),

});
