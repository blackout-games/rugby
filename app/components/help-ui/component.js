import Ember from 'ember';

export default Ember.Component.extend({
  
  tagName: 'a',
  classNames: ['help-ui','btn-a','no-hover'],
  classNameBindings: ['besideButton:help-ui-beside-button'],
  
  onClick: Ember.on('click',function(){
    
    this.set('showHelpWindow',true);
    
  }),
  
});
