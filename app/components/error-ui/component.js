import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['has-error'],
  classNameBindings: ['noError:hidden'],
  noError: Ember.computed.not('error'),
  
});
