import Ember from 'ember';

export default Ember.Component.extend({
  
  actions: {
    onBid(){
      
      this.set('reloadBids',true);
      Ember.run.next(()=>{
        this.set('reloadBids',false);
      });
      
    },
  },
  
});
