import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['loading-slider'],
  isLoading: false,
  cssAfterAnimation: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
  
  /**
   * Create bound functions so that 'this' exists even inside jquery event callback
   */
  setup: Ember.on('init',function(){
    
    this.waitBound = Ember.run.bind(this,this.wait);
    this.resetBound = Ember.run.bind(this,this.reset);
    
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
    
    this.resetListeners();
    this.$('span').addClass('animate').one(this.get('cssAfterAnimation'), this, this.waitBound);

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
    this.$('span').removeClass('wait').addClass('complete').one(this.get('cssAfterAnimation'), this, this.resetBound);
    
  },
  
  /**
   * Cancels any listeners
   */
  resetListeners() {
    
    this.$('span').off(this.get('cssAfterAnimation'), this, this.waitBound);
    this.$('span').off(this.get('cssAfterAnimation'), this, this.resetBound);
    
  },
  
  /**
   * Cancels any listeners and resets state
   */
  reset() {
    
    this.resetListeners();
    this.$('span').removeClass('animate wait complete');
    
  },

});
