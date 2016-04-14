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
      let $el = $(e.target);
      if(e.type==='mousedown' || $el.data('can-focus')){
        $el.focus();
      }
    });
    $('form input').on('touchstart',(e)=>{
      $(e.target).data('can-focus','1');
    });
    $('form input').on('touchmove',(e)=>{
      $(e.target).data('can-focus',null);
    });
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    $('form input').off('mousedown touchstart touchmove touchend');
    
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
  
  hasValidations: Ember.computed.alias('model.validations'),
  formIsValid: Ember.computed.alias('model.validations.isValid'),
  
  actions: {
    onSave(button){
      this.set('hasValidated',true);
      // Check if validation is all g.
      if(!this.get('hasValidations') || this.get('formIsValid')){
        if(this.attrs.onSave){
          this.$('.blackout-cancel-button').prop('disabled',true);
          
          /**
           * Send 3 functions to action
           * action( succeed, fail, final ){}
           */
          this.attrs.onSave((dontAnimate=false)=>{
            button.succeeded(true,dontAnimate);
            this.$('.blackout-cancel-button').prop('disabled',false);
          },()=>{
            button.reset();
            this.$('.blackout-cancel-button').prop('disabled',false);
          },(forceReset)=>{
            // Don't reset here, since if the consumer has nested promises, and calls this function in the finally clause on the parent promise, it will execute to early.
            // Plus we have different button animation for success
            
            if(forceReset){
              button.reset(true,true);
            }
          });
          
        }
      } else {
        button.reset();
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
    toggleItem(id){
      let item = this.get('linksShowing.'+id);
      if(item){
        this.set('linksShowing.'+id,false);
      } else {
        this.set('linksShowing.'+id,true);
      }
    },
  },
  
  linksShowing: Ember.Object.create(),
  
});
