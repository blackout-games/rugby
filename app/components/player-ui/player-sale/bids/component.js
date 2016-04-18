import Ember from 'ember';

export default Ember.Component.extend({
  
  store: Ember.inject.service(),
  
  hasSetup: false,
  
  onShow: Ember.on('didReceiveAttrs',function(opts){
    
    if( this.attrChanged(opts,'isOnScreen') ){
      
      if(this.get('isOnScreen') && !this.get('hasSetup')){
        this.setup();
        this.set('hasSetup',true);
      }
      
    }
    
  }),
  
  setup(){
    
    let store = this.get('store');
    let transferId = this.get('transfer.id');
    
    if(transferId){
      
      // Get bids
      let bidsQuery = {
        filter: {
          'transfer.id': transferId
        },
        sort: '-id',
      };
      
      store.query('bid',bidsQuery).then((data)=>{
        this.set('bids',data);
      });
      
    }
    
  }
  
});
