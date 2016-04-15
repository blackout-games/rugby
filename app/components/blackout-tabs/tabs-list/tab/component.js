import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['iblock'],
  
  hasInit: false,
  
  registration: Ember.on('didReceiveAttrs',function(){
    
    if(!this.get('hasInit')){
      if( !this.get('hide') && this.attrs.registerTab ){
        this.attrs.registerTab( this.get('tab'), this.get('name') );
      }
      
      this.set('hasInit',true);
    }
    
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$('a').on('mousedown touchstart',()=>{
      if( this.attrs.selectTab ){
        this.attrs.selectTab( this.get('tab') );
      }
    });
    
    this.$('a').on('click',(e)=>{
      e.preventDefault();
    });
    
    if(this.get('hide')){
      this.$().hide();
    }
    
  }),
  
  updateVisibility: Ember.on('didReceiveAttrs',function(opts){
    
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
