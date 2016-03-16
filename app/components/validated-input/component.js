import Ember from 'ember';

const {
  computed,
  defineProperty,
} = Ember;

/**
 * When sending actions to components, as a one off, see:
 * http://www.samselikoff.com/blog/getting-ember-components-to-respond-to-actions/
 * We use the event bus here as there can be many validated inputs per form.
 */

export default Ember.Component.extend({
  
  errorType: null,
  inputId: null,
  
  onInit: Ember.on('init',function(){
    
    if(this.get('valuePath')){
      
      var valuePath = this.get('valuePath');
      defineProperty(this, 'validation', computed.oneWay(`model.validations.attrs.${valuePath}`));
      defineProperty(this, 'value', computed.alias(`model.${valuePath}`));
      defineProperty(this, 'clientError', computed.alias(`model.validations.attrs.${valuePath}.message`));
      
    }
    
  }),
  
  onInsert: Ember.on('didInsertElement', function(){
    
    this.$('input[name="password"]').attr('autocomplete', 'off');
    
  }),
  
  hasDirtied: false,
  hasFocus: false,
  notValidating: computed.not('validation.isValidating'),
  isValid: computed.and('validation.isValid', 'notValidating'),
  isInvalid: computed('clientError', 'serverError', function(){
    return !Ember.isEmpty(this.get('clientError')) || !Ember.isEmpty(this.get('serverError'));
  }),
  
  showError: computed('hasFocus', 'validation.isDirty', 'isInvalid', 'hasValidated', 'hasDirtied', 'serverError', 'clientError', function(){
    return (
      (this.get('validation.isDirty') && this.get('hasDirtied'))
        || this.get('hasValidated')
    )
    && this.get('isInvalid')
    && (!this.get('hasFocus') || !Ember.isEmpty(this.get('serverError')));
  }),
  
  error: computed('hasFocus', 'clientError','serverError',function(){
    if(!Ember.isEmpty(this.get('serverError'))
      && (Ember.isEmpty(this.get('clientError')) || this.get('hasFocus'))){
      return this.get('serverError');
    } else {
      return this.get('clientError');
    }
  }),
  
  actions: {
    showErrors() {
      if( ! Ember.isEmpty(this.get('error') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    },
    hideErrors() {
      this.set("showError", false);
    },
    onFocus(){
      this.set('hasFocus',true);
    },
    onBlur(){
      this.set('hasFocus',false);
    },
    onKeyUp(value){
      this.set('hasDirtied',true);
      if(this.attrs.onChanged){
        this.attrs.onChanged(value);
      }
    }
  },
  
});
