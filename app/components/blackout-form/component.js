import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  /**
   * An object describing form elements
   * See 'account' for example
   */
  form: [],
  
  setup: Ember.on('didInsertElement',function(){
    
    // Force fast focus | use touchend for mobile so that we can still drag scrollable forms. Touchend still saves some time as sometimes there is a delay before the click event fires.
    $('form input').on('mousedown touchend',(e)=>{
      $(e.target).focus();
    });
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    $('form input').off('mousedown touchstart touchmove focus');
    
  }),
  
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
    
    if(this.get('model') && this.get('model').rollbackAttributes){
      this.get('model').rollbackAttributes();
    }
    
  }),
  
  actions: {
    onSave(button){
      this.set('hasValidated',true);
      if(this.attrs.onSave){
        this.$('.blackout-cancel-button').prop('disabled',true);
        this.attrs.onSave(()=>{
          button.succeeded(true);
          this.$('.blackout-cancel-button').prop('disabled',false);
        },()=>{
          button.reset();
          this.$('.blackout-cancel-button').prop('disabled',false);
        },()=>{
          // Don't reset here, since if the consumer has nested promises, and calls this function in the finally clause on the parent promise, it will execute to early.
        });
      }
    },
    onCancel(){
      // Reset the form
      //this.$('form')[0].reset();
      if(this.get('model').rollbackAttributes){
        this.get('model').rollbackAttributes();
      }
      
      if(this.attrs.onCancel){
        this.attrs.onCancel();
      }
    },
  }
  
  
});
