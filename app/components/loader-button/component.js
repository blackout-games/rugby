import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  myContext: { name: "loadingButtonState" },
  spinnerColor: "primary",
  classNames: ['loader-button','btn'],
  classNameBindings: ['confirmMode:confirm-button','noDisabledCursor:default-cursor'],
  
  isAnimating: false,
  whoAmI: 'loaderButton', // To verify this is a loader button component.
  
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
      this.$().addClass('is-loading');
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
    this.loadingCursor(true);
    
    this.set('isAnimating',true);
  },
  
  reset(allowFocus=true, force=false) {
    
    if(!force && this.get('ignoreNextReset')){
      this.set('ignoreNextReset',false);
      return;
    }
    
    this.set('ignoreNextReset',false);
    
    this.enable();
    // Don't do this, or it removes the ability to disable the button immediately after reset
    //Ember.run.next(()=>{
      //this.enable();
    //});
    this.$().removeClass('is-loading');
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
    this.loadingCursor(false);
    
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
        if(!this.get('isDestroyed')){
          this.set('laterId',false);
          
          if(!this.get('isDestroyed')){
            this.$().addClass('unsucceed');
            this.$().off(Ember.Blackout.afterCSSTransition,this.afterSucceed).one(Ember.Blackout.afterCSSTransition,this,this.afterSucceed);
            
            // Safetynet for firefox
            let laterId = Ember.run.later(()=>{
              this.$().off(Ember.Blackout.afterCSSTransition);
              this.set('laterId',false);
              this.afterSucceed({ data: this });
            },250);
            this.set('laterId',laterId);
          }
        }
      },1777);
      
      this.set('laterId',laterId);
      
    }
  },
  
  afterSucceed(e){
    let _this = e.data;
    
    let laterId = _this.get('laterId');
    if(laterId){
      Ember.run.cancel(laterId);
      _this.set('laterId',false);
    }
    
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
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    if(this.attrChanged(attrs,'disabled')){
      Ember.run.scheduleOnce('afterRender', this, ()=>{
        if(this.get('disabled')){
          this.disable();
        } else {
          this.enable();
        }
      });
    }
  }),
  
  disable(){
    this.$().prop('disabled',true);
    this.$().removeClass('hover');
    this.$().addClass('disabled');
  },
  
  enable(){
    this.$().prop('disabled',false);
    this.$().removeClass('disabled');
  },
  
  loadingCursor(on){
    if(on){
      this.$().addClass('loading');
    } else {
      this.$().removeClass('loading');
    }
  },
  
});
