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
    
    let newVal = key in options.newAttrs ? (typeof(options.newAttrs[key]) === 'object' && options.newAttrs[key] !== null && 'value' in options.newAttrs[key] ? options.newAttrs[key].value : options.newAttrs[key]) : null;
    
    if(!('oldAttrs' in options)){
      // Attr went from null, to something
      return newVal !== null;
    }
    
    let oldVal = key in options.oldAttrs ? (typeof(options.oldAttrs[key]) === 'object' && options.oldAttrs[key] !== null && 'value' in options.oldAttrs[key] ? options.oldAttrs[key].value : options.oldAttrs[key]) : null;
    
    return newVal !== oldVal;
    
  },
  
  parseAttrHash: Ember.on('didReceiveAttrs',function(attrs){
    if(this.attrChanged(attrs,'attrsHash')){
      let hash = this.get('attrsHash');
      Object.keys(hash).forEach(key=>{
        this.set(key,hash[key]);
      });
    }
  }),
  
};

/**
 * Extend ember-autoresize for textareas so that we can manually measure and resize
 */
Ember.TextArea.reopen(blackoutComponent,{
  onUpdateSizeManually: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'updateSizeManually') && this.get('updateSizeManually')){
      this.set('updateSizeManually',false);
      
      /**
       * The following structure is necessary to get a properly sized box across browsers, after switching tabs and back again.
       * Unfortunately.
       */
      
      let updated=false;
      if(this.$().width()!==100){
        this.measureSize();
        updated = true;
      }
      
      Ember.run.next(()=>{
        Ember.run.next(()=>{
          if(!updated){
            this.measureSize();
          }
        });
      });
      
    }
  }),
});

export function initialize(/* application */) {
  Ember.Component = Ember.Component.extend(blackoutComponent);
}

export default {
  name: 'component',
  after: 'blackout',
  initialize
};
