import Ember from 'ember';
import t from "../../../utils/translation-macro";

export default Ember.Component.extend({
  
  locale: Ember.inject.service(),
  settings: Ember.inject.service(),
  store: Ember.inject.service(),
  
  detectPlayerChange: Ember.on('didUpdateAttrs',function(opts){
    
    if(this.attrChanged(opts,'player')){
      let was = this.get('isOnScreen');
      this.set('isOnScreen',false);
      Ember.run.next(()=>{
        this.set('isOnScreen',was);
      });
    }
    
  }),
  
  defaultSaleDatetime: Ember.computed(function(){
    return Date.now();
  }), 
  
  actions: {
    firePlayer(button){
      
      this.set('actionsError',null);
      
      let player = this.get('player');
      //let clubId = this.get('player.club.id');
      
      player.deleteRecord();
      player.save().then(()=>{
        
        // Stop button loading
        button.succeed();
        
        // Go to squad route
        Ember.Blackout.transitionTo('squad.club','me');
        
        // TODO
        //Ember.Blackout.transitionTo('squad.club',clubId);
        
      },(err)=>{
        if(err && err.errors && err.errors.title){
          this.set('actionsError',err.errors.title);
        }
        button.reset();
      });
      
    },
    openSellPlayer(){
      this.set('showingSellPlayerBox',true);
    },
    onCancelSellPlayer(){
      //
    },
    listPlayer(succeed,fail,final){
      
      let store = this.get('store');
      let sellModel = this.get('sellModel');
      
      var transfer = store.createRecord('transfer', {
        listPrice: sellModel.get('listPrice'),
        deadline: sellModel.get('deadline'),
        player: this.get('player'),
        fireIfUnsold: sellModel.get('fireIfNotSold'),
      });
      
      transfer.save().then(()=>{
        
        // Success without animating
        succeed(true);
        
        this.set('showingSellPlayerBox',false);
        
        // Transition to player page
        let playerId = this.get('player.id');
        Ember.Blackout.transitionTo(`/players/${playerId}/sale`);
        
      }).catch((error)=>{
        fail(error);
      }).finally(final);
      
    },
    cancelSell(){
      this.set('showingSellPlayerBox',false);
    },
  },
  
  sellModel: Ember.computed(function(){
    if(this.get('_sellModel')){
      return this.get('_sellModel');
    } else {
      let model = Ember.Object.extend({
        listPrice: 1000,
        deadlineLength: this.get('deadlineLengthOptions')[0], // 3 days
        deadline: Ember.computed('deadlineLength','customDeadline',{
          get(){
            if(this.get('deadlineLength').value !== 0){
              return new Date( Date.now() + this.get('deadlineLength').value*24*60*60*1000 );
            } else {
              if(!this.get('customDeadline')){
                this.set('customDeadline',new Date(Date.now() + 3*24*60*60*1000));
              }
              return this.get('customDeadline');
            }
            
          },
          set(key,value){
            if(value instanceof Date){
              this.set('customDeadline',value);
            }
            return value;
          },
        }),
        transferTax: Ember.computed('listPrice',function(){
          return parseInt(this.get('listPrice'))*0.05;
        }),
        fireIfNotSold: false,
      }).create();
      this.set('_sellModel',model);
      return model;
    }
  }),
  
  sellForm: Ember.computed(function(){
    
    let minDate = Date.now() + this.get('settings.auctionMinDeadlineDays')*24*60*60*1000;
    let maxDate = Date.now() + this.get('settings.auctionMaxDeadlineDays')*24*60*60*1000;
    
    return [
      {
        id: 'listPrice',
        type: 'money',
        label: t('player.selling.list-price'),
        placeholder: '$',
        valuePath: 'listPrice',
      },
      {
        id: 'transferTax',
        type: 'moneyDisplay',
        isWarning: true,
        label: t('player.selling.transfer-tax'),
        valuePath: 'transferTax',
        helper: t('player.selling.transfer-tax-helper'),
      },
      {
        id: 'deadlineLength',
        type: 'select',
        label: t('player.selling.auction-length'),
        options: this.get('deadlineLengthOptions'),
        valuePath: 'deadlineLength',
      },
      {
        id: 'customDatetime',
        type: 'datetime',
        label: t('player.selling.custom-deadline'),
        valuePath: 'deadline',
        visibleOnKey: 'deadlineLength',
        visibleOnKeyValue: this.get('deadlineLengthOptions')[3],
        minDate: minDate,
        maxDate: maxDate,
      },
      {
        id: 'deadline',
        type: 'dateDisplay',
        label: t('player.selling.auction-deadline'),
        valuePath: 'deadline',
      },
      {
        id: 'fireIfNotSold',
        type: 'checkbox',
        label: t('player.selling.fire-if-unsold'),
        valuePath: 'fireIfNotSold',
      },
    ];
    
  }),
  
  deadlineLengthOptions: Ember.computed(function(){
    
    return [
      {
        label: t('language.plurals.day',{ count: 'count' }),
        value: 3,
        count: 3,
      },
      {
        label: t('language.plurals.week',{ count: 'count' },{ ucFirst: true }),
        value: 7,
        count: 1,
      },
      {
        label: t('language.plurals.week',{ count: 'count' }),
        value: 14,
        count: 2,
      },
      {
        label: t('buttons.custom-premium',{ premium: 'premium' }),
        value: 0,
        premium: '<i class="icon-star"></i>',
        disabled: !this.get('session.isPremium'),
      },
    ];
  }),
  
});
