import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['blackout-fader','inactive'],
  
  setup: Ember.on('didInsertElement',function(){
    if(this.get('active')){
      this.$().removeClass('inactive');
      
      if(!this.get('showing')){
        this.hide();
        Ember.Blackout.waitForHeightOfHidden(this.$(),(height)=>{
          this.set('height',height);
        });
      } else {
        Ember.Blackout.waitForHeightOfHidden(this.$(),(height)=>{
          this.set('height',height);
          this.show();
        });
      }
    }
  }),
  
  detectChange: Ember.on('didUpdateAttrs',function(opts){
    if( this.attrChanged(opts,'showing')){
      if(this.get('showing')){
        this.show();
      } else {
        this.hide();
      }
    }
  }),
  
  show(){
    this.$().css({
      'max-height': this.get('height'),
      opacity: 1,
    });
  },
  
  hide(){
    this.set('height',this.$().height());
    this.$().css({
      'max-height': '0px',
      opacity: 0,
    });
  },
  
});
