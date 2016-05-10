import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  /**
   * Set this outside of the component
   * @type {Boolean}
   */
  showWindow: false,
  
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
  classNameBindings: ['cache.gameNavIsOpen:game-nav-open'],
  
  isFirefox: Ember.computed(function(){
    return window.browsers.firefox;
  }),
  
  scrollComponent: Ember.computed(function(){
    if(this.get('isFirefox')){
      return 'normal-scroll-hidden';
    } else {
      return 'normal-scroll';
    }
  }),
  
  primaryClass: Ember.computed(function(){
    if(this.get('isFirefox')){
      return 'float-box-content-wrapper';
    } else {
      return 'float-box-content-wrapper float-box-content-scroller';
    }
  }),
  
  scrollerClass: Ember.computed(function(){
    if(this.get('isFirefox')){
      return 'float-box-content-scroller';
    } else {
      return '';
    }
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().insertBefore('.blackout-modals');
    
  }),
  
  detectAttrs: Ember.on('didReceiveAttrs',function(opts){
    
    if( this.attrChanged(opts,'showWindow')){
      if( this.get('showWindow') ){
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
        this.$('.float-box-bg, .has-feedback').on('mousedown touchstart',(e)=>{
          if(this.$(e.target).hasParent('.float-dash-box')){
            return;
          }
          // Left mouse button only
          if(e.type==='mousedown' && e.which!==1){
            return;
          }
          this.send('close');
        });
        
      },50);
      
      // Allow any mouse events
      this.$('.float-box-content-wrapper').removeClass('is-closing');
      
      // Animate
      let $scroller = this.$('.float-box-content-scroller');
        
      if(!this.get('slideMode')){
        
        Ember.Blackout.animateResetDuration($scroller);
        Ember.Blackout.animateEaseOutExpo($scroller);
        
        if(this.get('fadeDirection')==='up'){
          Ember.Blackout.unFadeInUp($scroller);
          Ember.Blackout.unFadeOutDown($scroller);
          Ember.Blackout.fadeInUp($scroller);
        } else {
          Ember.Blackout.unFadeInDown($scroller);
          Ember.Blackout.unFadeOutUp($scroller);
          Ember.Blackout.fadeInDown($scroller);
        }
        
        $scroller.off(Ember.Blackout.afterCSSAnimation);
        
      }
      
      // Scroll to top
      $scroller[0].scrollTop = 0;
      
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
      
      // Disallow any mouse events
      this.$('.float-box-content-wrapper').addClass('is-closing');
        
      if(!this.get('slideMode')){
        
        let $scroller = this.$('.float-box-content-scroller');
        
        Ember.Blackout.animateFast($scroller);
        Ember.Blackout.animateEaseOutExpo($scroller);
        
        if(this.get('fadeDirection')==='up'){
          Ember.Blackout.unFadeInUp($scroller);
          Ember.Blackout.unFadeOutDown($scroller);
          Ember.Blackout.fadeOutDown($scroller);
        } else {
          Ember.Blackout.unFadeInDown($scroller);
          Ember.Blackout.unFadeOutUp($scroller);
          Ember.Blackout.fadeOutUp($scroller);
        }
        
        $scroller.off(Ember.Blackout.afterCSSAnimation);
        
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
      this.set('showWindow',false);
    }
  }
  
});
