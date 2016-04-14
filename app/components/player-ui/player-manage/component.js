import Ember from 'ember';
import t from "../../../utils/translation-macro";

export default Ember.Component.extend({
  
  locale: Ember.inject.service(),
  settings: Ember.inject.service(),
  store: Ember.inject.service(),
  
  showSell: Ember.on('didInsertElement',function(){
    Ember.run.next(()=>{
      this.send('openSellPlayer');
    });
  }),
  
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
        button.succeeded();
        
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
      //log('closed da serll playa');
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
        this.resetErrors();
        
        this.set('showingSellPlayerBox',false);
        
        // Transition to player page
        let playerId = this.get('player.id');
        Ember.Blackout.transitionTo(`/players/${playerId}/sale`);
        
      }).catch((error)=>{
        
        this.resetErrors();
        fail();
        
        let errObject = Ember.Object.create(error);
        
        let item = errObject.get('errors.item');
        if(item){
          this.set('serverErrors.'+item,errObject.get('errors'));
          this.notifyPropertyChange('serverErrors');
        } else {
          this.set('serverError',errObject.get('errors.title'));
        }
        
      }).finally(final);
      
    },
    cancelSell(){
      this.set('showingSellPlayerBox',false);
    },
    toggleToggle(val){
      log('toggled',val);
    }
  },
  
  serverErrors: {},
  
  resetErrors(){
    this.set('serverError',null);
    this.set('serverErrors',{});
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
                this.set('customDeadline',Date.now() + 3*24*60*60*1000);
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
  
  sellForm: Ember.computed('serverErrors',function(){
    
    let minDate = Date.now() + this.get('settings.auctionMinDeadlineDays')*24*60*60*1000;
    let maxDate = Date.now() + this.get('settings.auctionMaxDeadlineDays')*24*60*60*1000;
    
    return [
      {
        id: 'listPrice',
        type: 'money',
        label: t('player.selling.list-price'),
        placeholder: '$',
        valuePath: 'listPrice',
        serverError: this.get('serverErrors.listPrice.title'),
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
        serverError: this.get('serverErrors.deadline.title'),
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
