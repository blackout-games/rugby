import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "button",
  myContext: { name: "loadingButtonState" },
  spinnerColor: "primary",
  classNames: ['loader-button','btn'],
  
  isAnimating: false,
  whoAmI: 'loaderButton', // To verify this is a loader button component.
  
  
  attributeBindings: [],
  
  setAction: Ember.on('init', function(){
    this.set('clickAction',this.get('action'));
    this.set('action',null);
  }),
  
  click() {
    
    // NOTE, The first button in the form receives a click event when enter is pressed.
    
    // Animate and disable
    this.animate();
    
    // Send action
    this.sendAction('clickAction',this);
    
    // Don't bubble
    return false;
    
  },
  
  animate() {
    
    // Save widths
    this.set('outerWidth',this.$().outerWidth());
    this.set('originalWidth',this.$().css('width'));
    
    // Remove padding
    this.$().addClass('loading');
    this.$().css('width',this.get('outerWidth'));
    
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
    this.$().css('width',this.get('originalWidth'));
    
    if(allowFocus){
      Ember.run.debounce(Ember.FormContext,()=>{
        this.$().focus();
      },1);
    }
    
    this.set('isAnimating',false);
    this.set('hasSucceeded',false);
  },
  
  succeeded(ignoreNextReset=false){
    this.reset();
    if(ignoreNextReset){
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
            this.reset();
          }
        });
      }
    },1777);
  },
  
});
