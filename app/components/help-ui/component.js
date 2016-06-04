import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'a',
  classNames: ['help-ui','btn-a','no-hover'],
  classNameBindings: ['besideButton:help-ui-beside-button'],
  
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
      
      this.$('i').on(window.os.touchOS ? 'touchstart' : 'mouseenter',this.get('showBound'));
    },777);
    
  }),
  
  cancelTimer(){
    let timeoutId = this.get('timeoutId');
    if(timeoutId){
      window.clearTimeout(timeoutId);
      this.set('timeoutId',null);
    }
  },
  
  show(){
    if(!this.get('tooltipIsVisible')){
      
      this.set('tooltipIsVisible',true);
      this.cancelTimer();
      let timeoutId = window.setTimeout(()=>{
        this.set('timeoutId',null);
        this.hide();
      },5000);
      this.set('timeoutId',timeoutId);
      
      this.$('i').on(window.os.touchOS ? 'touchstart' : 'mouseleave',this.get('hideBound'));
      Ember.run.next(()=>{
        Ember.$('body').on('mousedown touchstart',this.get('handleClickBound'));
      });
      
    }
  },
  
  hide(){
    if(this.get('tooltipIsVisible')){
      
      this.cancelTimer();
      this.set('tooltipIsVisible',false);
      
      this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseleave',this.get('hideBound'));
      Ember.$('body').off('mousedown touchstart',this.get('handleClickBound'));
      
    }
  },
  
  handleClick(){
    this.hide();
  },
  
  onDestroy: Ember.on('willDestroyElement',function(){
    
    Ember.$('body').off('mousedown touchstart',this.get('handleClickBound'));
    this.set('handleClickBound',null);
    
    this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseenter',this.get('showBound'));
    this.$('i').off(window.os.touchOS ? 'touchstart' : 'mouseleave',this.get('hideBound'));
    this.set('showBound',null);
    this.set('hideBound',null);
    
  }),
  
});
