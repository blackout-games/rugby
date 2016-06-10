import Ember from 'ember';
//const { $ } = Ember;

/**
 * Attributes:
 * 
 * imageUrl: [optional] image URL
 * images: [optional] image list to choose from
 * route: [optional] the route name to use to remember the image picked (allows multiple routes to use the same images list, but not have the same image)
 * height: [optional] min-height for the header
 * 
 */

export default Ember.Component.extend({
  height: '15vh',
  
  setup: Ember.on( 'didInsertElement', function(){
    
    let padding;
    if(this.get('media.isMobile')){
      padding = '44px'; // To show image cover
    } else {
      padding = '27px';
    }
    
    // Adjust height
    this.$().findClosest('.page-header').css({
      'min-height': this.get('height'),
      'padding-top': padding,
    });
    
  }),
  
});
