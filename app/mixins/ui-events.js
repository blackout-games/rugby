import Ember from 'ember';

export default Ember.Mixin.create({
  
  setupUIEvents: Ember.on('didInsertElement', function(){
    
    if(!this.get('uiEvents')){
      return;
    }
    
    var self = this;
    var obj = this.$();
    
    if(this.get('uiEvents.selector')){
      obj = obj.find(this.get('uiEvents.selector'));
    }
    
    Ember.$.each(this.get('uiEvents'),function(eventName, callbackName){
      
      if(eventName==="selector"){
        return true;
      }
      
      if( typeof(callbackName) === 'object' ){
        let uiEvent = callbackName;
        eventName = uiEvent.eventName;
        callbackName = uiEvent.callbackName;
        if(uiEvent.selectorFunction){
          var func = Ember.run.bind(self,self[uiEvent.selectorFunction]);
          var selector = func();
          obj = Ember.$(selector);
        } else {
          obj = Ember.$(uiEvent.selector);
        }
      }
      
      self[callbackName + 'Bound'] = Ember.run.bind(self,self[callbackName]);
      obj.on( eventName, self[callbackName + 'Bound'] );
      
    });
    
    this.set('uiEventsObj',obj);
    
  }),
  
  cleanUIEvents: Ember.on('willDestroyElement', function(){
    
    if(!this.get('uiEvents')){
      return;
    }
    
    var self = this;
    
    Ember.$.each(this.get('uiEvents'),function(eventName, callbackName){
      
      if( typeof(callbackName) === 'object' ){
        let uiEvent = callbackName;
        eventName = uiEvent.eventName;
        callbackName = uiEvent.callbackName;
        let obj = Ember.$(uiEvent.selector);
        
        if(self.get(callbackName + 'Bound')){
          obj.off(eventName,self.get(callbackName + 'Bound'));
        }
      
      } else {
        
        if(self.get(callbackName + 'Bound')){
          self.get('uiEventsObj').off(eventName,self.get(callbackName + 'Bound'));
        }
        
      }
      
    });
    
  }),
  
});
