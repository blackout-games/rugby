import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  min:0,
  max:10,
  step:1,
  
  onInit: Ember.on('init',function(){
    if(isNaN(this.get('value'))){
      this.set('value',Math.round((this.get('max') - this.get('min'))/2));
    }
    this.set('initValue',this.get('value'));
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    Ember.run.scheduleOnce('afterRender',this,()=>{
      
      let slider = this.$('input').bubbleSlider({
        min: this.get('min'),
        max: this.get('max'),
        step: this.get('step'),
        value: this.get('initValue'),
        onInput: Ember.run.bind(this,this.actions.changed)
      });
      
      let $wrap = this.$('.bubble-slider-wrap');
      let initialWidth = $wrap.width();
      
      // Wait for width to change (meaning it has rendered)
      Ember.Blackout.waitForWidthToChange($wrap,initialWidth,()=>{
        slider.setValue(this.get('initValue'));
        slider.positionThumb(this.get('initValue'));
      });
      
      // Replace plus and minus with our own icons
      this.$('.bubble-slider-plus').html('<i class="icon-plus icon-vcenter"></i>');
      this.$('.bubble-slider-minus').html('<i class="icon-minus icon-vcenter"></i>');
      
      // Register for special btn events
      this.$('.bubble-slider-plus, .bubble-slider-minus').addClass('btn-events');
      this.$('.bubble-slider-thumb').addClass('btn-events');
      
      // Show native element to screen readers
      this.$('input').show().addClass('hidden-but-accessible');
      
      // Hide bubble based on attr
      if(this.get('noBubble')){
        this.$('.bubble-slider-bubble').hide();
      }
      
      this.setupEvents();
      
      this.set('slider',slider);
      
    });
    
  }),
  
  setupEvents(){
    
    let $wrap = this.$('.bubble-slider-wrap');
    let $thumb = this.$('.bubble-slider-thumb');
    let $input = this.$('input');
    let clickIsLocal = false;
    
    // Create bound functions
    if(!this.get('docClickBound')){
      this.set('docClickBound',Ember.run.bind(this,this.docClick));
    }
    
    $wrap.on('click',()=>{
      this.addFocus();
      clickIsLocal = false;
    });
    
    $wrap.on('mousedown touchstart',()=>{
      clickIsLocal = true;
    });
    
    $thumb.on('mousedown touchstart',()=>{
      this.addFocus();
    });
    
    $input.on('focus',()=>{
      this.addFocus(true);
    });
    
    $input.on('blur',()=>{
      this.removeFocus(true,clickIsLocal);
    });

    // Close the select element if the target it´s not the select element or one of its descendants
    $(document).on( 'mousedown touchstart', this.get('docClickBound'));

    /**
     * Keyboard events
     */
    $input.on( 'keydown', ( e ) => {
      let keyCode = e.keyCode || e.which;
      
      switch (keyCode) {
        // up/right keys
        case 38:
        case 39:
          e.preventDefault();
          this.increaseValue();
          break;
        // down/left keys
        case 37:
        case 40:
          e.preventDefault();
          this.decreaseValue();
          break;
        // esc key
        case 27:
          e.preventDefault();
          this.removeFocus();
          break;
      }
      
    });

    $input.on( 'keyup', ( e ) => {
      let keyCode = e.keyCode || e.which;
      
      switch (keyCode) {
        // up/right keys
        case 38:
        case 39:
          e.preventDefault();
          this.endIncreaseValue();
          break;
        // down/left keys
        case 37:
        case 40:
          e.preventDefault();
          this.endDecreaseValue();
          break;
      }
      
    });
    
  },
  
  cleanupListeners: Ember.on('willDestroyElement',function(){
    
    if(this.get('docClickBound')){
      
      let $wrap = this.$('.bubble-slider-wrap');
      let $thumb = this.$('.bubble-slider-thumb');
      let $input = this.$('input');
      
      $(document).off('mousedown touchstart mousewheel', this.get('docClickBound'));
      $wrap.off('click mousedown touchstart');
      $thumb.off('mousedown touchstart');
      $input.off('focus blur keydown keyup');
      
      this.set('docClickBound',false);
      
    }
    
  }),
  
  /**
   * Handle a click somewhere other than the slider
   */
  docClick(e){
    var target = e.target;
    let $wrap = this.$('.bubble-slider-wrap');
    
    if( target !== $wrap[0] && !$(target).hasParent( $wrap )) {
      
      this.removeFocus();
      
    }
  },
  
  addFocus(fromInput){
    if(!fromInput){
      
      // Causes native UI to show on mobile. But we need focus on desktop so that arrow keys are captured by the input and not cause a potential scrollable parent to scroll
      if(!window.os.touchOS){
        this.$('input').focus();
      }
    }
    this.$('.bubble-slider-thumb').addClass('focus');
  },
  
  removeFocus(fromInput,clickIsLocal){
    if(!fromInput){
      this.$('input').blur();
    }
    if(!clickIsLocal){
      this.$('.bubble-slider-thumb').removeClass('focus');
    }
  },
  
  increaseValue(){
    
    let val = parseInt(this.get('value'));
    let slider = this.get('slider');
    
    val += this.get('step');
    val = Math.min(val,this.get('max'));
    
    slider.setValue(val);
    slider.positionThumb(val);
    
    // Visually tap the '+' button
    this.$('.bubble-slider-plus').addClass('press');
    
  },
  
  endIncreaseValue(){
    // Visually finish tapping the '+' button
    this.$('.bubble-slider-plus').removeClass('press');
  },
  
  decreaseValue(){
    
    let val = parseInt(this.get('value'));
    let slider = this.get('slider');
    
    val -= this.get('step');
    val = Math.max(val,this.get('min'));
    
    slider.setValue(val);
    slider.positionThumb(val);
    
    // Visually tap the '-' button
    this.$('.bubble-slider-minus').addClass('press');
    
  },
  
  endDecreaseValue(){
    // Visually finish tapping the '-' button
    this.$('.bubble-slider-minus').removeClass('press');
  },
  
  actions: {
    changed(val){
      if(this.get('skippedInit')){
        
        this.set('value',val);
        if(!this.get('hasChanged') && val!==this.get('initValue')){
          this.set('hasChanged',true);
        }
        if(this.get('hasChanged') && this.attrs.onChange && typeof this.attrs.onChange === 'function'){
          this.attrs.onChange(val);
        }
        
      } else {
        
        this.set('skippedInit',true);
      
      }
    },
  },
  
});
