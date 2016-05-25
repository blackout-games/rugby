import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  classNames: ['inline-block','no-hover'],
  tagName: 'span',
  hasInit: false,
  inline: true,
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      
      if(!this.get('item') && this.get('itemId')){
        
        let itemId = this.get('itemId');
        let type = this.get('type');
        
        this.get('store').findRecord(type,itemId).then((data)=>{
          this.set('item',data);
          
          if(this.attrs.getItem){
            this.attrs.getItem(data);
          }
          
          return data;
        });
        
      }
      
      this.set('hasInit',true);
      
    }
  }),
  
  displayName: Ember.computed('item',function(){
    
    if(this.get('type') === 'election'){
      return this.get('item.country.name') + ' ' + this.get('item.title');
    } else {
      return this.get('item.name');
    }
    
  }),
  
});
