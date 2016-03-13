import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['loading-slider'],
  isLoading: false,
  
  /**
   * Create bound functions so that 'this' exists even inside jquery event callback
   */
  setup: Ember.on('init',function(){
    
    this.waitBound = Ember.run.bind(this,this.wait);
    this.resetBound = Ember.run.bind(this,this.reset);
    this.fadeOutBound = Ember.run.bind(this,this.fadeOut);
    
  }),
  
  /**
   * Handle loading start and stop
   */
  handler: Ember.on('didUpdateAttrs', function(options){

    let o = options.oldAttrs;
    let n = options.newAttrs;

    if (!o.isLoading.value && n.isLoading.value) {

      // Launch new animation
      this.animate();

    } else if (o.isLoading.value && !n.isLoading.value) {

      // Complete the animation
      this.complete();

    }

  }),
  
  /**
   * Starts the animation, increases width to 20%
   */
  animate() {
    
    this.reset();
    this.$('span').removeClass('complete');
    this.$('span').addClass('animate').one(Ember.Blackout.afterCSSTransition, this, this.waitBound);

  },
  
  /**
   * Slides slowly (100+ seconds) and waits for loading to complete
   */
  wait() {
    
    this.$('span').addClass('wait');
    
  },
  
  /**
   * Called when loading is complete, slides quickly to 100% while fading out
   */
  complete() {
    
    this.resetListeners();
    this.$('span').removeClass('wait').addClass('complete').one(Ember.Blackout.afterCSSTransition, this, this.fadeOutBound);
    
  },
  
  /**
   * Called when slider has slidden to 100%
   */
  fadeOut() {
    
    this.resetListeners();
    Ember.run.later(()=>{
      this.$('span').removeClass('wait').addClass('fadeout').one(Ember.Blackout.afterCSSTransition, this, this.resetBound);
    },111);
    
    
  },
  
  /**
   * Cancels any listeners
   */
  resetListeners() {
    
    this.$('span').off(Ember.Blackout.afterCSSTransition, this, this.waitBound);
    this.$('span').off(Ember.Blackout.afterCSSTransition, this, this.resetBound);
    this.$('span').off(Ember.Blackout.afterCSSTransition, this, this.fadeOutBound);
    
  },
  
  /**
   * Cancels any listeners and resets state
   */
  reset() {
    this.resetListeners();
    this.$('span').removeClass('animate wait complete fadeout');
    
  },

});
