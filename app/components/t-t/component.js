import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  tagName: 'span',
  
  updateComponents: Ember.on('didReceiveAttrs',function(opts){
    
    let newAttrs = opts.newAttrs;
    let components = {};
    
    $.each(newAttrs,(key,val)=>{
      
      if( key !== 't' && typeof val === 'object' ){
        let keys = Object.keys(val);
        if(keys.length && keys[0].indexOf('COMPONENT_')>=0){
          components[key] = val;
        }
      }
      
    });
    
    this.set('_components',components);
    
  }),
  
  parts: Ember.computed('_components','t','i18n.locale',function(){
    
    let attrs = [];
    let components = this.get('_components');
    let componentKeys = Object.keys(components);
    
    $.each(this.attrs,(key,val)=>{
      if( key !== 't'){
        if( componentKeys.indexOf(key)<0 ){
          attrs[key] = val;
        } else {
          attrs[key] = `{{${key}}}`;
        }
      }
    });
    
    let content = this.get('i18n').t(this.get('t'),attrs).toString();
    content = content.replace(/\{\{(\w+?)\}\}/g,(fullMatch)=>{
      return `{{split}}${fullMatch}{{split}}`;
    });
    
    let parts = content.split('{{split}}');
    
    parts.forEach((val,i)=>{
      let isComponent;
      let key = val.replace(/\{\{(\w+?)\}\}/g,(fullMatch,key)=>{
        isComponent = true;
        return key;
      });
      
      if(isComponent && components[key]){
        parts[i] = {
          isComponent: true,
          content: components[key]
        };
      } else {
        parts[i] = {
          content: Ember.String.htmlSafe(val)
        };
      }
      
    });
    
    return parts;
    
  }),
  
}).reopenClass({
  positionalParams: ['t']
});