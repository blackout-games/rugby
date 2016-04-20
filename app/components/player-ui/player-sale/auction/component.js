import Ember from 'ember';
import t from "../../../../utils/translation-macro";

export default Ember.Component.extend({
  
  store: Ember.inject.service(),
  
  /**
   * Will house the new bid
   */
  bid: null,
  
  setup: Ember.on('init',function(){
    this.createNewBid();
  }),
  
  actions: {
    openBid(){
      this.set('showBiddingWindow',true);
    },
    closeBid(){
      this.set('showBiddingWindow',false);
    },
    placeBid(succeed,fail,final){
      
      let model = this.get('bid');
      
      model.save().then(()=>{
        
        // Success without animating
        succeed(true);
        
        this.set('showBiddingWindow',false);
        
      }).catch((error)=>{
        fail(error);
      }).finally(()=>{
        this.refreshTransferAndBids();
        final();
      });
      
    },
    cancelSell(){
      this.set('showingSellPlayerBox',false);
    },
  },
  
  refreshTransferAndBids(){
    
    let store = this.get('store');
    
    // Refresh transfer
    Ember.Blackout.startLoading();
    let transfer = store.peekRecord('transfer',this.get('transfer.id'));
    transfer.reload().then(()=>{
      Ember.Blackout.stopLoading();
      this.createNewBid();
    });
    
    // Refresh bids and transfer
    this.attrs.onBid();
    
  },
  
  createNewBid(){
    
    if(this.get('session.isAuthenticated')){
      
      let store = this.get('store');
      let transfer = this.get('transfer');
      let minNextBid = transfer.get('minimumNextBid');
      
      let model = store.createRecord('bid',{
        bid: minNextBid,
        autoBid: false,
        transfer: transfer,
        club: this.get('session.club'),
      });
      
      this.set('bid',model);
      
    }
    
  },
  
  bidForm: Ember.computed(function(){
    
    return [
      {
        id: 'bid',
        type: 'money',
        label: t('buttons.bid'),
        placeholder: '$',
        valuePath: 'bid',
      },
      {
        id: 'autoBid',
        type: 'checkbox',
        label: t('player.for-sale.auto-bid'),
        valuePath: 'autoBid',
        isPremium: 'premium.feature-message',
        premiumFeatureName: 'premium.features.auto-bidding'
      },
    ];
    
  }),
  
});
