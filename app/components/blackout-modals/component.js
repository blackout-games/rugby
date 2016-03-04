import Ember from 'ember';
var $ = Ember.$;
//import { translationMacro as t } from "ember-i18n";
import t from "../../utils/translation-macro";

export default Ember.Component.extend({
  
  animationDuration: 277, // Mimic CSS
  letUsKnowActionName: 'letUsKnow', // TODO
  
  /**
   * Default properties
   */
  defaults: {
    type: 'notice',
    title: t('modals.notice.title'),
    message: 'Hello, this is a modal',
    actionHtml: '',
    buttons: [
      {
        'label': t('modals.buttons.ok'),
        'action': 'hide'
      },
    ],
    extraButtons: [
    ],
    showDefaultAction: true, // Shows 'Please let us know' link
  },
  
  /**
   * Actual properties
   * Setting this makes the magic happen
   */
  modal: {},
  
  /**
   * Modal types (one at a time)
   * @type {Boolean}
   */
  types: ['notice','error'],
  
  /**
   * Setup
   */
  
  setup: Ember.on('didInsertElement', function(){
    var bus = this.get('EventBus');
    
    this.$().hide();
    
    // Listen for events
    bus.subscribe('showModal',this,this.show);
    bus.subscribe('hideModal',this,this.hide);
    
    /*
    this.show({
      'type': 'error',
      'title': 'Test Error',
      'showAction': true,
    });
    */
  }),
  
  /**
   * Show modal
   */
  
  show(btnOptions) {
    if( !btnOptions ){
      btnOptions = {};
    }
    
    let self = this;
    
    // Merge new options over defaults
    var options = Ember.Object.extend(this.get('defaults')).create();
    options.setProperties(btnOptions);
    
    // Add extra buttons
    if( options.extraButtons ){
      options.buttons = options.extraButtons.concat(options.buttons);
    }
    
    // Magic!
    this.set('modal',options);
    
    this.setType( options.type );
    
    this.setProperties(options);
    
    this.send('show');
    
  },
  
  
  /**
   * Hide modal
   */
  hide() {
    this.send('hide');
  },
  
  /**
   * Creation
   */
  
  setType(newType) {
    
    var self = this;
    if(newType==='warning'){
      newType = 'error';
    }
    
    $.each(this.get('types'),function(index,type){
      self.set('is' + type.ucFirst() + 'Modal',type===newType);
      
      // General class
      if( type===newType ){
        self.$().find('.modal-panel').addClass(type);
      } else {
        self.$().find('.modal-panel').removeClass(type);
      }
    });
    
    // Icon
    this.$().find('.modal-icon').attr('class','modal-icon icon-vcenter');
    if( newType === 'notice'){
      self.$().find('.modal-icon').addClass('icon-info icon-2x');
    } else if ( newType === 'error' ){
      self.$().find('.modal-icon').addClass('icon-attention  icon-lg');
    }
    
  },
  
  /**
   * Actions
   */
  
  actions: {
    show() {
      this.cancelHideTimer();
      this.cancelShowLater();
      this.$().show().find('.modal-panel-wrapper,.modal-panel').removeClass('going').addClass('coming');
      var self = this;
      var showLater = Ember.run.later(function(){
        self.$().find('.modal-background,.modal-panel,.modal-panel-wrapper').addClass('showing');
        self.$().find('.modal-background').removeClass('hiding');
        Ember.run.later(function(){
          $(':focus').blur();
        },10);
      },10);
      self.set('showLater',showLater);
      
    },
    hide() {
      this.cancelHideTimer();
      this.$().show().find('.modal-panel-wrapper,.modal-panel').removeClass('coming').addClass('going');
      var self = this;
      Ember.run.next(function(){
        self.$().find('.modal-background,.modal-panel,.modal-panel-wrapper').removeClass('showing');
        self.$().find('.modal-background').addClass('hiding');
        var runLater = Ember.run.later(self,function(){
          self.$().hide();
        },self.get('animationDuration'));
        self.set('runLater',runLater);
      });
      
      // Run callback function if exists
      if(typeof(this.get('modal.callback')) === 'function'){
        this.get('modal.callback')();
      }
    },
  },
  
  cancelHideTimer() {
    var runLater = this.get('runLater');
    if( runLater ){
      Ember.run.cancel(runLater);
      this.set('runLater',null);
    }
  },
  
  cancelShowLater() {
    var showLater = this.get('showLater');
    if( showLater ){
      Ember.run.cancel(showLater);
      this.set('showLater',null);
    }
  },
  
});
