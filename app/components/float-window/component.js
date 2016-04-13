import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  /**
   * Set this outside of the component
   * @type {Boolean}
   */
  isOnScreen: false,
  
  /**
   * When true, float window slides all the way from the top offscreen
   * When false, we use fadeMode
   * @type {Boolean}
   */
  slideMode: false,
  
  /**
   * When slideMode is false, set the fade direction
   * up | down
   * @type {String}
   */
  fadeDirection: 'up',
  
  classNames: ['float-box'],
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().insertBefore('.blackout-modals');
    
  }),
  
  detectAttrs: Ember.on('didReceiveAttrs',function(opts){
    
    if( this.attrChanged(opts,'isOnScreen')){
      if( this.get('isOnScreen') ){
        this.show();
      } else {
        this.hide();
      }
    }
    
  }),
  
  show(){
    if(!this.get('hasShown')){
      
      this.$().removeClass('hiding').show();
      this.$('.float-box-bg').off(Ember.Blackout.afterCSSTransition);
      
      Ember.run.later(()=>{
        this.$().addClass('showing');
        this.$('.float-box-bg').on('mousedown touchstart',(e)=>{
          // Left mouse button only
          if(e.type==='mousedown' && e.which!==1){
            return;
          }
          this.send('close');
        });
        
      },50);
      
      // Animate
      let $wrapper = this.$('.float-box-content-wrapper');
        
      if(!this.get('slideMode')){
        
        Ember.Blackout.animateResetDuration($wrapper);
        Ember.Blackout.animateEaseOutExpo($wrapper);
        
        if(this.get('fadeDirection')==='up'){
          Ember.Blackout.unFadeInUp($wrapper);
          Ember.Blackout.unFadeOutDown($wrapper);
          Ember.Blackout.fadeInUp($wrapper);
        } else {
          Ember.Blackout.unFadeInDown($wrapper);
          Ember.Blackout.unFadeOutUp($wrapper);
          Ember.Blackout.fadeInDown($wrapper);
        }
        
        $wrapper.off(Ember.Blackout.afterCSSAnimation);
        
      }
      
      // Scroll to top
      $wrapper[0].scrollTop = 0;
      
      this.set('hasShown',true);
    }
  },
  
  hide(){
    if(this.get('hasShown')){
      
      this.$().addClass('hiding');
      this.$().removeClass('showing');
      this.$('.float-box-bg').off('mousedown touchstart');
      this.set('hasShown',false);
      if(this.attrs.onClose){
        this.attrs.onClose();
      }
        
      if(!this.get('slideMode')){
        
        let $wrapper = this.$('.float-box-content-wrapper');
        
        Ember.Blackout.animateFast($wrapper);
        Ember.Blackout.animateEaseOutExpo($wrapper);
        
        if(this.get('fadeDirection')==='up'){
          Ember.Blackout.unFadeInUp($wrapper);
          Ember.Blackout.unFadeOutDown($wrapper);
          Ember.Blackout.fadeOutDown($wrapper);
        } else {
          Ember.Blackout.unFadeInDown($wrapper);
          Ember.Blackout.unFadeOutUp($wrapper);
          Ember.Blackout.fadeOutUp($wrapper);
        }
        
        $wrapper.off(Ember.Blackout.afterCSSAnimation);
        
        this.$('.float-box-bg').off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
          this.$().hide().removeClass('hiding');
        });
        
      } else {
          
        this.$('.float-box-bg').off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
          this.$().hide().removeClass('hiding');
        });
        
      }
      
    }
  },
  
  actions: {
    close(){
      this.set('isOnScreen',false);
    }
  }
  
});
