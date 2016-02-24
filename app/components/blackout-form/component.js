import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  
  /**
   * An object describing form elements
   * See 'account' for example
   */
  form: [],
  
  computedForm: Ember.computed('form',function(){
    
    let form = this.get('form');
    
    Ember.$.each(form,(key,item)=>{
      
      // Set default type if not given
      if(!item.type){
        item.type = 'text';
      }
      
    });
    
    return form;
    
  }),
  
  resetModel: Ember.on('willDestroyElement',function(){
    
    if(this.get('model')){
      this.get('model').rollbackAttributes();
    }
    
  }),
  
  
  actions: {
    onSave(button){
      this.set('hasValidated',true);
      if(this.attrs.onSave){
        this.$('.blackout-cancel-button').prop('disabled',true);
        this.attrs.onSave(()=>{
          button.reset();
          button.succeeded();
        },()=>{
          button.reset();
        },()=>{
          this.$('.blackout-cancel-button').prop('disabled',false);
        });
      }
    },
    onCancel(){
      
      // Reset the form
      //this.$('form')[0].reset();
      this.get('model').rollbackAttributes();
      
      if(this.attrs.onCancel){
        this.attrs.onCancel();
      }
    },
  }
  
  
});
