import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  myContext: { name: "loadingButtonState" },
  spinnerColor: "primary",
  classNames: ['loader-button','btn'],
  classNameBindings: ['confirmMode:confirm-button','noDisabledCursor:default-cursor'],
  attributeBindings: ['disabled'],
  
  isAnimating: false,
  whoAmI: 'loaderButton', // To verify this is a loader button component.
  
  disabled: false,
  
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
    this.disable();
    
    this.set('isAnimating',true);
  },
  
  reset(allowFocus=true, force=false) {
    
    if(!force && this.get('ignoreNextReset')){
      this.set('ignoreNextReset',false);
      return;
    }
    
    this.enable();
    // Don't do this, or it removes the ability to disable the button immediately after reset
    //Ember.run.next(()=>{
      //this.enable();
    //});
    this.$().removeClass('loading');
    this.$().find('.content').show();
    
    if(!this.get('confirmMode')){
      this.$().css('width',this.get('originalWidth'));
    }
    
    if(allowFocus){
      Ember.run.debounce(Ember.FormContext,()=>{
        if(this.$()){
          this.$().focus();
        }
      },1);
    }
    
    this.set('isAnimating',false);
    this.set('hasSucceeded',false);
    this.set('loading',false);
    
    this.$().removeClass('unsucceed');
    
    this.$().off(Ember.Blackout.afterCSSTransition,this.afterSucceed);
    
    if(this.get('laterId')){
      Ember.run.cancel(this.get('laterId'));
    }
    
  },
  
  succeed(ignoreNextReset=false, dontAnimate=false){
    this.reset(false);
    if(!dontAnimate){
      this.disable();
      
      if(ignoreNextReset){
        // If reset() is called by a consumer soon after succeed()
        this.set('ignoreNextReset',true);
      }
      this.set('hasSucceeded',true);
      let laterId = Ember.run.later(()=>{
        this.set('laterId',false);
        
        if(!this.get('isDestroyed')){
          this.$().addClass('unsucceed');
          this.$().off(Ember.Blackout.afterCSSTransition,this.afterSucceed).one(Ember.Blackout.afterCSSTransition,this,this.afterSucceed);
        }
      },1777);
      
      this.set('laterId',laterId);
      
    }
  },
  
  afterSucceed(e){
    let _this = e.data;
    if(!_this.get('isDestroyed')){
      Ember.run.later(()=>{
        if(!_this.get('isDestroyed')){
          _this.$().removeClass('unsucceed');
          // If reset() is not called by a consumer soon after succeed()
          _this.set('ignoreNextReset',false);
          _this.reset(false);
        }
      },44);
      _this.set('hasSucceeded',false);
    }
  },
  
  disable(){
    this.set('disabled',true);
    this.$().removeClass('hover');
  },
  
  enable(){
    this.set('disabled',false);
  },
  
});
