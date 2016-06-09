import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'a',
  classNames: ['help-ui','btn-a','no-hover'],
  classNameBindings: ['besideButton:help-ui-beside-button','iconSize'],
  
  hideAfterDelay: 0,//5000,
  
  iconSize: Ember.computed('size',function(){
    return this.get('size') === 'small' ? 'help-ui-small' : '';
  }),
  
  onClick: Ember.on('click',function(){
    
    this.set('showHelpWindow',true);
    
  }),
  
  onInit: Ember.on('init',function(){
    this.set('showBound',Ember.run.bind(this,this.show));
    this.set('hideBound',Ember.run.bind(this,this.hide));
    this.set('handleClickBound',Ember.run.bind(this,this.handleClick));
  }),
  
  onInsert: Ember.on('didInsertElement',function(){
    
    // Should wait a minimum of the length of time of general transition animation
    Ember.run.later(()=>{
      this.set('renderTooltip',true);
      
      this.$('i').on(window.os.touchOS ? 'touchstart' : 'mouseenter mousedown click',this.get('showBound'));
    },777);
    
  }),
  
  cancelTimer(){
    let timeoutId = this.get('timeoutId');
    if(timeoutId){
      window.clearTimeout(timeoutId);
      this.set('timeoutId',null);
    }
  },
  
  show(e){
    if(!this.get('tooltipIsVisible')){
      
      this.set('tooltipIsVisible',true);
      
      if(this.get('hideAfterDelay')){
        this.cancelTimer();
        let timeoutId = window.setTimeout(()=>{
          this.set('timeoutId',null);
          this.hide();
        },this.get('hideAfterDelay'));
        this.set('timeoutId',timeoutId);
      }
      
      this.$('i').on(window.os.touchOS ? 'touchstart' : 'mouseleave',this.get('hideBound'));
      Ember.run.next(()=>{
        Ember.$('body').on('mousedown touchstart',this.get('handleClickBound'));
      });
      
      this.set('hideOnNextClick',false);
      
    }
    
    if(e.type==='click' && !this.get('hideOnNextClick') && !window.os.touchOS){
      this.$('i').off( 'mouseleave',this.get('hideBound'));
      this.set('hideOnNextClick',true);
      this.$('i').on('click',this.get('hideBound'));
    }
  },
  
  hide(){
    if(this.get('tooltipIsVisible')){
      
      this.cancelTimer();
      this.set('tooltipIsVisible',false);
      
      this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseleave click',this.get('hideBound'));
      Ember.$('body').off('mousedown touchstart',this.get('handleClickBound'));
      
    }
  },
  
  handleClick(e){
    
    // Left mouse button only
    if(e.which!==1){
      return;
    }
    
    let forceHide = false;
    if(e.type==='click' && this.get('hideOnNextClick')){
      this.set('hideOnNextClick',false);
      forceHide = true;
    }
    
    if(forceHide || (!Ember.$(e.target).hasParent(this.$()) && Ember.$(e.target)[0] !== this.$()[0])){
      this.hide();
    }
  },
  
  onDestroy: Ember.on('willDestroyElement',function(){
    
    Ember.$('body').off('mousedown touchstart',this.get('handleClickBound'));
    this.set('handleClickBound',null);
    
    this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseenter mousedown click',this.get('showBound'));
    this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseleave',this.get('hideBound'));
    this.set('showBound',null);
    this.set('hideBound',null);
    
  }),
  
});
