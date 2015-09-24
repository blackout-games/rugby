import Ember from 'ember';

export default Ember.Route.extend({
  
  isReallyBlocked: false,
  
  beforeModel: function(){
    
    // Don't allow users here unless they're actually blocked
    if(this.get('isReallyBlocked')){
      // Do nothing
    } else {
      this.set('isReallyBlocked',true);
      this.transitionTo('dashboard');
    }
    
  },
  
});
