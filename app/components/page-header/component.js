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
    
    // Adjust height
    this.$().findClosest('.page-header').css({
      'min-height': this.get('height'),
      'padding-top': '33px',
    });
    
    // Set background
    Ember.run.schedule('afterRender', this, function () {
      if(this.get('imageUrl')){
        this.get('EventBus').publish('setNewBackground',this.get('imageUrl'));
      }
      if(this.get('images')){
        this.get('EventBus').publish('setNewBackgrounds',this.get('images'));
      }
    }); 
    
    // Animate
    // Must apply to children because applying to parent means we have to remove the 'animated' class on completion, but the skill bars don't seem to like this in Chrome. Likely a Chrome display bug. May be able to switch back to parent at a later date.
    Ember.Blackout.animateUI(this.$().parent().children());
    
  }),
  
});
