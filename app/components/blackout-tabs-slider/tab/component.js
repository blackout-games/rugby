import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'a',
  classNameBindings: [
    'icon-class:vc-parent',
    'icon-class:blackout-tabs-slider-tab',
    'icon-class:col-fixed',
    'icon-class:no-webkit-highlight',
    'icon-class:no-hover',
    'isSelected:active',
  ],
  
  hasInit: false,
  
  isSelected: Ember.computed('selectedTab',function(){
    return this.get('selectedTab') === this.get('tab');
  }),
  
  registration: Ember.on('didReceiveAttrs',function(){
    
    if(!this.get('hasInit')){
      
      if( this.attrs.registerTab ){
        this.attrs.registerTab( this.get('tab'), this.get('name') );
      } 
      
      this.set('hasInit',true);
    }
    
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('tab')){
      this.$().data('tab-id',this.get('tab'));
    }
    
    this.$().on('mousedown',()=>{
      if( this.attrs.selectTab ){
        this.attrs.selectTab( this.get('tab'), true );
      }
    });
    
    this.$().on('click',(e)=>{
      e.preventDefault();
    });
    
    // Handle touch devices
    let canClick = false;
    this.$().on('touchstart',()=>{
      Ember.run.later(()=>{
        if(canClick){
          if( this.attrs.selectTab ){
            this.attrs.selectTab( this.get('tab'), true );
          }
        }
      },144);
      canClick = true;
    });
    this.$().on('touchmove',()=>{
      canClick = false;
    });
    
    if(this.get('hide')){
      this.$().hide();
    }
    
  }),
  
  updateVisibility: Ember.on('didUpdateAttrs',function(opts){
    
    if(this.attrChanged(opts,'hide')){
      
      if(this.get('hide')){
        this.$().hide();
        if( this.attrs.deregisterTab ){
          this.attrs.deregisterTab( this.get('tab') );
        }
      } else {
        this.$().show();
        if( this.attrs.registerTab ){
          this.attrs.registerTab( this.get('tab') );
        }
      }
      
    }
    
  }),
  
});
