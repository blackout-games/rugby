import Ember from 'ember';

export default Ember.Component.extend({
  
  userImages: Ember.inject.service(),
  tagName: 'span',
  
  createHTML: Ember.on('didInsertElement',function(){
    
    let data = this.get('manager');
    let manager;
    
    if(Ember.isArray(data)){
      manager = data.get('firstObject');
    } else {
      manager = data;
    }
    
    let html = this.get('userImages').getManagerHTML( manager );
    
    // Create link
    this.$().html(html);
    
  }),
  
});
