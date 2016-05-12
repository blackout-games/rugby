import Ember from 'ember';

export default Ember.Component.extend({
  
  defaultHeight: 150,
  bufferSize: 1,
  
  onInit: Ember.on('init',function(){
    
    let vcTagName = this.get('verticalCollectionTag');
    
    // Create a fresh css pseudo rule
    Ember.Blackout.addCSSRule( vcTagName + ' .vertical-item', 'min-height: '+this.get('defaultHeight')+'px;');
    
  }),
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    
    /**
     * contentProxy fixes some and mirrors vertical-collection when it's rendered
     * while under display: none.
     * We wait till next run-loop before passing on content, when it's ready to go
     */
    if(this.attrChanged(attrs,'content') && this.get('content')){
      Ember.run.next(()=>{
        this.set('contentProxy',this.get('content'));
      });
    }
    
  }),
  
  scrollerSelectorProp: Ember.computed('scrollerSelector',function(){
    if(this.get('scrollerSelector')){
      return this.get('scrollerSelector');
    } else {
      return '#nav-body';
    }
  }),
  
  verticalCollectionTag: Ember.computed(function(){
    return 'vertical-collection-' + Ember.Blackout.generateId().toLowerCase();
  }),
  
});
