import Ember from 'ember';

export default Ember.Mixin.create({
  
  /**
   * Set this on consumer to let it know where to apply event listeners
   * @type {Array}
   */
  //preventBodyScrollItems: [''],
  
  /**
   * Set this on consumer to also prevent mouse wheel from causing the body to scroll when limits are reached
   * @type {Array}
   */
  //preventMouseWheelPropagation: false,
  
  setupPreventBodyScroll: Ember.on('didInsertElement',function(){
    
    if(!Ember.Blackout.isEmpty(this.get('preventBodyScrollItems'))){
      
      Ember.$.each(this.get('preventBodyScrollItems'),(key,val)=>{
        this.$(val).on('touchstart', this.handleTouchStart);
        this.$(val).on('touchmove', this.handleTouchMove);
        
        if(this.get('preventMouseWheelPropagation')){
          this.$(val).on('mousewheel',this.handleMouseWheel);
        }
      });
      
    }
    
  }),
  
  cleanupPreventBodyScroll: Ember.on('willDestroyElement',function(){
    
    if(!Ember.Blackout.isEmpty(this.get('preventBodyScrollItems'))){
      
      Ember.$.each(this.get('preventBodyScrollItems'),(key,val)=>{
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

  },

  handleTouchMove(e) {
    var pageY = e.originalEvent.touches[0].pageY;
    
    if (!this.lastY) {
      this.lastY = pageY;
    }
    
    var up = (pageY > this.lastY),
      down = !up;
    
    if ((this.lastDirectionUp && !up) || (!this.lastDirectionUp && up)) {
      Ember.$(e.target).trigger('touchstart');
    }
    
    this.lastY = pageY;
    this.lastDirectionUp = up;
    
    if ((up && this.allowUp) || (down && this.allowDown)) {
      e.stopPropagation();
    } else {
      e.preventDefault();
    }

  },
  
});
