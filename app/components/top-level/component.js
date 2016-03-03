import Ember from 'ember';

export default Ember.Component.extend({
  
  setup: Ember.on( 'didInsertElement', function(){
    
    // Set background
    Ember.run.schedule('afterRender', this, function () {
      
      if( Ember.Blackout.isEmpty(this.get('imageUrl')) && Ember.Blackout.isEmpty(this.get('images')) ){
        
        this.get('EventBus').publish('removeBackground');
        
      } else {
        
        if(this.get('imageUrl')){
          this.get('EventBus').publish('setNewBackground',this.get('imageUrl'));
        }
        if(this.get('images')){
          this.get('EventBus').publish('setNewBackgrounds',this.get('images'));
        }
        
      }
      
    }); 
    
    // Animate
    // Must apply to children because applying to parent means we have to remove the 'animated' class on completion, but the skill bars don't seem to like this in Chrome. Likely a Chrome display bug. May be able to switch back to parent at a later date.
    Ember.Blackout.animateUI(this.$().parent().children());
    
  }),
  
});
