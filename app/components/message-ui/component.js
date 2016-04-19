import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['gap-lg','color-bg-text'],
  classNameBindings: ['type','hideIf:hidden'],
  
  hideIf: Ember.computed.not('showIf'),
  
});
