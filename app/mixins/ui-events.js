import Ember from 'ember';

export default Ember.Mixin.create({
  
  uiEventsHasBeenSetup: false,
  
  updateUIEventsStatus(uiEventsActive){
    if(uiEventsActive){
      this.setupUIEvents();
    } else {
      this.cleanUIEvents();
    }
  },
  
  setupUIEvents: Ember.on('didInsertElement', function(){
    
    if(!this.get('uiEvents') || this.get('uiEventsHasBeenSetup')){
      return;
    }
    
    var obj = this.$();
    
    if(this.get('uiEvents.selector')){
      obj = obj.find(this.get('uiEvents.selector'));
    }
    
    Ember.$.each(this.get('uiEvents'),(eventName, callbackName)=>{
      
      if(eventName==="selector"){
        return true;
      }
      
      if( typeof(callbackName) === 'object' ){
        let uiEvent = callbackName;
        eventName = uiEvent.eventName;
        callbackName = uiEvent.callbackName;
        if(uiEvent.selectorFunction){
          var func = Ember.run.bind(this,this[uiEvent.selectorFunction]);
          var selector = func();
          obj = Ember.$(selector);
        } else {
          obj = Ember.$(uiEvent.selector);
        }
      }
      
      this[callbackName + 'Bound'] = Ember.run.bind(this,this[callbackName]);
      obj.on( eventName, this[callbackName + 'Bound'] );
      
    });
    
    this.set('uiEventsObj',obj);
    this.set('uiEventsHasBeenSetup',true);
    
  }),
  
  cleanUIEvents: Ember.on('willDestroyElement', function(){
    
    if(!this.get('uiEvents') || !this.get('uiEventsHasBeenSetup')){
      return;
    }
    
    Ember.$.each(this.get('uiEvents'),(eventName, callbackName)=>{
      
      if( typeof(callbackName) === 'object' ){
        let uiEvent = callbackName;
        eventName = uiEvent.eventName;
        callbackName = uiEvent.callbackName;
        let obj = Ember.$(uiEvent.selector);
        
        if(this.get(callbackName + 'Bound')){
          obj.off(eventName,this.get(callbackName + 'Bound'));
        }
      
      } else {
        
        if(this.get(callbackName + 'Bound')){
          this.get('uiEventsObj').off(eventName,this.get(callbackName + 'Bound'));
        }
        
      }
      
    });
    
    this.set('uiEventsObj',false);
    this.set('uiEventsHasBeenSetup',false);
    
  }),
  
});
