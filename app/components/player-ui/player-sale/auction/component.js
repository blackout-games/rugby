import Ember from 'ember';

export default Ember.Component.extend({
  
  actions: {
    openBid(){
      this.set('showBiddingWindow',true);
    }
  },
  
});
