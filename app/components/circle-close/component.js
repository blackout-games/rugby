import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ["circle-close"],
  action: 'close',
  actions: {
    primary: function(){
      this.sendAction('action');
    }
  }
});
