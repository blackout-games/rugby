import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['action-box-content'],
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    if((this.attrChanged(attrs,'isShowing') && this.get('isShowing')) || this.attrChanged(attrs,'button') && this.get('button')){
      
      Ember.run.scheduleOnce('afterRender', this, ()=>{
        
        let sides = this.get('outerPaddingSides');
        let w = this.get('button').outerWidth(true) + sides;
        let h = this.get('button').outerHeight(true);
        let offset = this.get('buttonHeightOffset');
        if(isNaN(offset)){ offset=0; }
        
        this.$('.action-box-button-panel').width(w);
        this.$('.action-box-button-panel').height(h+offset);
        this.$('.action-box-angle-panel').height(h+offset);
        
      });
      
    }
  }),
  
  
  onInsert: Ember.on('didInsertElement',function(){
    
    let top = this.get('outerPaddingTop');
    let sides = this.get('outerPaddingSides');
    
    this.$().css({
      margin: `-${top}px -${sides}px 0px -${sides}px`,
    });
    
  }),
  
});
