import Ember from 'ember';

var blackoutComponent = {
  
  scrollContextId: Ember.computed('window.features.lockBody', function(){
    return window.features.lockBody ? 'nav-body' : null;
  }),
  
  scrollSelector: Ember.computed('window.features.lockBody', function(){
    return window.features.lockBody ? '#nav-body' : window;
  }),
  
  assertComponentStillExists(){
    return !this.get('isDestroyed') && !this.get('isDestroying');
  },
  
  attrChanged(options,key){
    
    if(!('oldAttrs' in options)){
      return false;
    }
    
    let oldVal = key in options.oldAttrs ? (typeof(options.oldAttrs[key]) === 'object' && options.oldAttrs[key] !== null && 'value' in options.oldAttrs[key] ? options.oldAttrs[key].value : options.oldAttrs[key]) : null;
    let newVal = key in options.newAttrs ? (typeof(options.newAttrs[key]) === 'object' && options.newAttrs[key] !== null && 'value' in options.newAttrs[key] ? options.newAttrs[key].value : options.newAttrs[key]) : null;
    
    return newVal !== oldVal;
    
  },
  
};

export function initialize(/* application */) {
  Ember.Component = Ember.Component.extend(blackoutComponent);
}

export default {
  name: 'component',
  after: 'blackout',
  initialize
};
