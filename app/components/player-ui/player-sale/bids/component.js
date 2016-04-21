import Ember from 'ember';

export default Ember.Component.extend({
  
  store: Ember.inject.service(),
  
  hasSetup: false,
  
  handleAttrs: Ember.on('didReceiveAttrs',function(opts){
    
    if( this.attrChanged(opts,'isOnScreen') ){
      
      if(this.get('isOnScreen') && !this.get('hasSetup')){
        this.loadBids();
        this.set('hasSetup',true);
      }
      
    }
    
    if( this.attrChanged(opts,'reloadBids') && this.get('reloadBids') ){
      
      this.loadBids();
      
    }
    
  }),
  
  bidsLoaded: false,
  
  loadBids(){
    
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
      
      this.set('bids',null);
      this.set('bidsLoaded',false);
      store.query('bid',bidsQuery).then((data)=>{
        this.set('bids',data);
        this.set('bidsLoaded',true);
      });
      
    }
    
  }
  
});
