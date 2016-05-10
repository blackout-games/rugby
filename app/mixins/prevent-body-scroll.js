import Ember from 'ember';

export default Ember.Mixin.create({
  
  /**
   * Set this on consumer to let it know where to apply event listeners
   * Leave empty to use it on the main component element
   * @type {Array}
   */
  preventBodyScrollSelectors: [],
  
  /**
   * Set this on consumer to also prevent mouse wheel from causing the body to scroll when limits are reached
   * @type {Array}
   */
  //preventMouseWheelPropagation: false,
  
  setupPreventBodyScroll: Ember.on('didInsertElement',function(){
    
    let selectors = this.get('preventBodyScrollSelectors');
    
    if(Ember.Blackout.isEmpty(selectors)){
      
      // Apply to component by default
      if(this.$().length){
        selectors = this.$();
        this.set('preventBodyScrollSelectors',selectors);
      } else {
        selectors = [
          null
        ];
      }
      
    }
    
    if(!this.get('disablePreventBodyScroll')){
      
      Ember.$.each(selectors,(key,val)=>{
        
        this.$(val).on('touchstart', this, this.handleTouchStart);
        this.$(val).on('touchmove', this, this.handleTouchMove);
        
        if(this.get('preventMouseWheelPropagation')){
          this.$(val).on('mousewheel',this, this.handleMouseWheel);
        }
        
      });
      
      
    }
    
  }),
  
  cleanupPreventBodyScroll: Ember.on('willDestroyElement',function(){
    
    if(!Ember.Blackout.isEmpty(this.get('preventBodyScrollSelectors'))){
      
      Ember.$.each(this.get('preventBodyScrollSelectors'),(key,val)=>{
        this.$(val).off('touchstart', this.handleTouchStart);
        this.$(val).off('touchmove', this.handleTouchMove);
        this.$(val).off('mousewheel',this.handleMouseWheel);
      });
      
    }
    
  }),
  
  handleMouseWheel(e) {

    this.allowUp = (this.scrollTop > 0);
    this.allowDown = (this.scrollTop < this.scrollHeight - Ember.$(this).outerHeight());
    
    if(e.originalEvent.wheelDelta >= 0 && !this.allowUp
      || e.originalEvent.wheelDelta < 0 && !this.allowDown){
      e.preventDefault();
    }
    e.stopPropagation();
  
  },

  handleTouchStart(e) {
    
    this.allowUp = (this.scrollTop > 0);
    this.allowDown = (this.scrollTop < this.scrollHeight - Ember.$(this).outerHeight());
    this.prevTop = null;
    this.prevBot = null;
    this.lastY = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0].pageY : this.lastY;
    
    // For doing it ourselves when we reverse direction after being blocked
    //this.startY = this.lastY;
    //this.startTop = this.scrollTop;

  },

  handleTouchMove(e) {
    let _this = e.data;
    var pageY = e.originalEvent.touches[0].pageY;
    if (!this.lastY) {
      this.lastY = pageY;
    }
    if (!this.lastScrollTop) {
      this.lastScrollTop = this.scrollTop;
    }
    
    // Do it ourselves
    /*if(this.lastWasAllowed && this.lastScrollTop===this.scrollTop){
      
      let moved = pageY - this.startY;
      this.scrollTop = this.startTop - moved;
      // Needs momentum
      
    }*/
    
    var up = (pageY > this.lastY),
        down = (pageY < this.lastY);
    
    if ((this.lastDirectionUp && !up) || (!this.lastDirectionUp && up)) {
      Ember.run.once(this,_this.triggerTouchStart,e);
    }
    
    if ((up && this.allowUp) || (down && this.allowDown) || (!up&&!down)) {
      e.stopPropagation();
      this.lastWasAllowed = true;
    } else {
      e.preventDefault();
      this.lastWasAllowed = false;
    }
    
    this.lastY = pageY;
    this.lastScrollTop = this.scrollTop;
    this.lastDirectionUp = up;

  },
  
  triggerTouchStart(e){
    Ember.$(e.target).trigger('touchstart');
  },
  
});
