import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

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
        
      }).catch(fail).finally(()=>{
        this.refreshTransferAndBids();
        final();
      });
      
    },
    cancelSell(){
      this.set('showingSellPlayerBox',false);
    },
    withdrawPlayer(button){
      
      let store = this.get('store');
      let model = store.peekRecord('transfer',this.get('transfer.id'));
      
      model.deleteRecord();
      model.save().then(()=>{
        
        // Success without animating
        button.succeed(false,true);
        
        // Transition to player home
        let playerId = this.get('player.id');
        Ember.Blackout.transitionTo(`/players/${playerId}`);
        
      },(error)=>{
        this.set('withdrawError',error.errors.title);
      });
      
    },
    refreshAuction(button){
      button.reset();
      button.disable();
      button.loadingCursor(true);
      this.refreshTransferAndBids(button);
    },
    updateFireIfUnsold(toggled){
      
      let store = this.get('store');
      let model = store.peekRecord('transfer',this.get('transfer.id'));
      
      if(model){
        let fireIfUnsold = this.get('transfer.fireIfUnsold');
        
        if(fireIfUnsold !== toggled){
          model.set('fireIfUnsold',toggled);
          Ember.Blackout.startLoading();
          model.patch({ fireIfUnsold: true }).then(()=>{
            
            Ember.Blackout.stopLoading();
            
          },(error)=>{
            print(error);
          });
        }
      }
      
    },
  },
  
  canWithdraw: Ember.computed('player','transfer',function(){
    let playerListed = new Date(this.get('transfer.listed')).getTime();
    let currentTime = Date.now();
    return this.get('session').ownedClub(this.get('player.club.id'))
      && (currentTime-playerListed) < 48*60*60*1000;
  }),
  
  withdrawDeadline: Ember.computed('transfer',function(){
    let playerListed = new Date(this.get('transfer.listed')).getTime();
    return new Date(playerListed + 48*60*60*1000);
  }),
  
  refreshTransferAndBids(button){
    
    let store = this.get('store');
    
    // Refresh transfer
    Ember.Blackout.startLoading();
    let transfer = store.peekRecord('transfer',this.get('transfer.id'));
    transfer.reload().then(()=>{
      Ember.Blackout.stopLoading();
      if(button){
        button.enable();
        button.loadingCursor(false);
      }
      this.createNewBid();
    });
    
    // Refresh bids and transfer
    this.attrs.onBid();
    
  },
  
  refreshBid: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'transfer')){
      this.createNewBid();
    }
  }),
  
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
  
  
  lastIncremented: 0,
  
  incrementViews: Ember.on('didReceiveAttrs',function(opts){
    
    if(this.attrChanged(opts,'isOnScreen') && this.get('isOnScreen')){
      
      // Give 30 second gap between view increments
      if(this.get('lastIncremented') < Date.now() - 30*1000){
        
        let transfer = this.get('store').peekRecord('transfer',this.get('transfer.id'));
        transfer.set('increment',{
          views: 1,
        });
        transfer.patch();
        
        this.set('lastIncremented',Date.now());
      }
      
    }
    
  }),
  
});
