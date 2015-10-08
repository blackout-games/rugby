import Ember from 'ember';

export default Ember.Mixin.create({
  
  setupComponent: Ember.on('didInsertElement', function() {
    
    this.adjustFullHeight();
    
    this.adjustFullHeightBound = Ember.run.bind(this, this.adjustFullHeight);
    Ember.$(window).on('resize', this.adjustFullHeightBound);
    
  }),

  adjustFullHeight() {
    this.$().height(Ember.$(window).height());
  },


  cleanFullHeight: Ember.on('willDestroyElement', function() {
    if(this.adjustFullHeightBound){
      Ember.$(window).off('resize', this.adjustFullHeightBound);
    }
  }),

});
