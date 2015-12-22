import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['floating-button-wrapper'],
  align: 'right',
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().addClass(this.get('align'));
    this.$(':first-child').addClass(this.get('align'));
    
    if( this.get('color') ){
      this.$(':first-child').addClass('color-' + this.get('color'));
    }
    
    if( this.get('z') && !isNaN(this.get('z')) ){
      this.$().css('z-index',this.get('z'));
    }
    
  }),

});
