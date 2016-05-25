import Ember from 'ember';

export default Ember.Component.extend({
  
  text: Ember.inject.service(),
  
  parts: Ember.computed('event',function(){
    
    let parsed = this.get('text').parse(this.get('event'));
    let components = parsed.components;
    let content = parsed.str.replace(/\{\{(\w+?)\}\}/g,(fullMatch)=>{
      return `{{split}}${fullMatch}{{split}}`;
    });
    
    let parts = content.split('{{split}}');
    
    parts.forEach((val,i)=>{
      let isComponent;
      let key = val.replace(/\{\{(\w+?)\}\}/g,(fullMatch,key)=>{
        isComponent = true;
        return key;
      });
      
      if(isComponent && components.get(key)){
        parts[i] = {
          isComponent: true,
          component: components.get(key)
        };
      } else {
        parts[i] = {
          content: Ember.String.htmlSafe(val)
        };
      }
      
    });
    
    return parts;
    
  }),
  
});
