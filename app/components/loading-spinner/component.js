import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ["spinner"],
  bars: false,
  circles: false,
  spinner: 'bars',
  color: 'primary',
  align: 'center',
  
  startup: function(){
    
    // Type
    if( this.get('spinner') === 'circles' ){
      this.set('circles',true);
    } else if ( this.get('spinner') === 'bars' ){
      this.set('bars',true);
    }
    
    // ALignment
    if( this.get('align') === 'left' ){
      this.$().addClass('left');
    } else if( this.get('align') === 'right' ){
      this.$().addClass('right');
    }
    
  }.on('init'),
  
  setup: function(){
    this.$().addClass(this.get('spinner'));
    this.$().addClass(this.get('color'));
  }.on('didInsertElement'),
  
});
