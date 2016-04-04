import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  myContext: { name: "loadingButtonState" },
  spinnerColor: "primary",
  classNames: ['loader-button','btn'],
  classNameBindings: ['confirmMode:confirm-button'],
  
  isAnimating: false,
  whoAmI: 'loaderButton', // To verify this is a loader button component.
  
  
  attributeBindings: [],
  
  setAction: Ember.on('init', function(){
    this.set('clickAction',this.get('action'));
    this.set('action',null);
  }),
  
  externalLoading: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'loading')){
      if(this.get('loading')){
        this.animate();
      }
    }
  }),
  
  click() {
    
    if(this.get('confirmMode')){
      
    } else {
      
      // NOTE, The first button in the form receives a click event when enter is pressed.
      
      // Animate and disable
      this.animate();
      
    }
    
    // Send action
    this.sendAction('clickAction',this);
    
    // Don't bubble
    return false;
    
  },
  
  animate() {
    
    if(!this.get('confirmMode')){
      
      // Save widths
      this.set('outerWidth',this.$().outerWidth());
      this.set('originalWidth',this.$().css('width'));
      
      // Remove padding
      this.$().addClass('loading');
      this.$().css('width',this.get('outerWidth'));
      
    }
    
    // Show button spinner
    this.$().find('.content').hide();
    this.$().find('.spinner').removeClass('hidden');
    
    // Hide keyboard
    this.$().focus();
    Ember.run.debounce(this,()=>{
      this.$().blur();
    },1);
    
    // Disable button
    this.$().attr('disabled',true);
    
    this.set('isAnimating',true);
  },
  
  reset(allowFocus = true) {
    
    if(this.get('ignoreNextReset')){
      this.set('ignoreNextReset',false);
      return;
    }
    
    this.$().attr('disabled',false);
    this.$().removeClass('loading');
    this.$().find('.content').show();
    
    if(!this.get('confirmMode')){
      this.$().css('width',this.get('originalWidth'));
    }
    
    if(allowFocus){
      Ember.run.debounce(Ember.FormContext,()=>{
        this.$().focus();
      },1);
    }
    
    this.set('isAnimating',false);
    this.set('hasSucceeded',false);
    this.set('loading',false);
    
  },
  
  succeeded(ignoreNextReset=false){
    this.reset();
    if(ignoreNextReset){
      // If reset() is called by a consumer soon after succeeded()
      this.set('ignoreNextReset',true);
    }
    this.set('hasSucceeded',true);
    Ember.run.later(()=>{
      if(!this.get('isDestroyed')){
        this.$().addClass('unsucceed');
        this.$().off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
          if(!this.get('isDestroyed')){
            Ember.run.later(()=>{
              if(!this.get('isDestroyed')){
                this.$().removeClass('unsucceed');
              }
            },44);
            // If reset() is not called by a consumer soon after succeeded()
            this.set('ignoreNextReset',false);
            this.reset();
          }
        });
      }
    },1777);
  },
  
  disable(){
    this.$().prop('disabled',true);
  },
  
  enable(){
    this.$().prop('disabled',false);
  },
  
});
