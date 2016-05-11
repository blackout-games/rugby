import Ember from 'ember';

export default Ember.Component.extend({
  
  defaultHeight: 150,
  
  onInit: Ember.on('init',function(){
    
    let vcTagName = this.get('verticalCollectionTag');
    
    // Create a fresh css pseudo rule
    Ember.Blackout.addCSSRule( vcTagName + ' .vertical-item', 'min-height: '+this.get('defaultHeight')+'px;');
    
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
