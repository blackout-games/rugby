import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  /**
   * Set this outside of the component
   * @type {Boolean}
   */
  isShowing: false,
  
  classNames: ['float-box'],
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().insertBefore('.blackout-modals');
    
  }),
  
  detectAttrs: Ember.on('didReceiveAttrs',function(opts){
    
    if( this.attrChanged(opts,'isShowing')){
      if( this.get('isShowing') ){
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
      this.set('hasShown',true);
    }
  },
  
  hide(){
    if(this.get('hasShown')){
      this.$().addClass('hiding');
      this.$().removeClass('showing');
      this.$('.float-box-bg').off('mousedown touchstart');
      this.$('.float-box-bg').off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition,()=>{
        this.$().hide().removeClass('hiding');
      });
      this.set('hasShown',false);
    }
  },
  
  actions: {
    close(){
      this.set('isShowing',false);
    }
  }
  
});
