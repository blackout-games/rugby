import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  classNames: ['inline-block'],
  imageSize: 'medium',
  tagName: 'span',
  hasInit: false,
  
  setupAttrs: Ember.on('didReceiveAttrs',function(){
    if(!this.get('hasInit')){
      if(!this.get('manager') && !this.get('managerId') && !this.get('managerUsername') && this.get('session.isAuthenticated')){
        
        // Use current manager
        this.set('manager',this.get('session.manager'));
        
      }
      
      if((this.get('managerId') || this.get('managerUsername')) && !this.get('manager')){
        
        let idOrUsername = this.get('managerId') ? this.get('managerId') : this.get('managerUsername');
        
        this.get('store').findRecord('manager',String(idOrUsername).pkString()).then((data)=>{
          this.set('manager',data);
          
          if(this.attrs.getManager){
            this.attrs.getManager(data);
          }
          
          return data;
        });
        
      }
      
      this.set('hasInit',true);
    }
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('inline')){
      this.$().css('margin-right','-3px');
    }
    
  }),
  
});
