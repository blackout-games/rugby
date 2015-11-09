import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * Bootstrap style modifier i.e. xs, sm, md, or lg (will apply to the specified level and wider)
   * @type {String}
   */
  widthAndUp: 'xs',
  
  /**
   * Bootstrap style modifier i.e. xs, sm, md, or lg (will apply to the specified level only)
   * @type {String}
   */
  widthOnly: '',
  
  
  classNames: ['vf-child','row','row-vertical'],
  
  setup: Ember.on('didInsertElement', function(){
    
    // Make sure parent is a vertical filler parent
    this.$().parent().addClass('vf-parent');
    
    // Set width where applied
    if(this.get('widthOnly')){
      
      this.$().findClosest('.sticky-footer-body').addClass('col-flex-' + this.get('widthOnly'));
      
      let nextWidth;
      
      if(this.get('widthOnly')=='xs'){
        nextWidth = 'sm';
      } else if(this.get('widthOnly')=='sm'){
        nextWidth = 'md';
      } else if(this.get('widthOnly')=='md'){
        nextWidth = 'lg';
      }
      
      if(nextWidth){
        this.$().findClosest('.sticky-footer-body').addClass('col-fixed-' + nextWidth);
      }
      
    } else {
      
      this.$().findClosest('.sticky-footer-body').addClass('col-flex-' + this.get('widthAndUp'));
      
    }
    
    // Consume footer content
    this.$().findClosest('.sticky-footer-wrapper').prepend(this.$().findClosest('.sticky-footer'));
    
  })
  
});
