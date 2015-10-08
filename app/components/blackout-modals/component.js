import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  
  animationDuration: 277, // Mimic CSS
  
  /**
   * Basic properties
   */
  defaults: {
    type: 'notice',
    title: 'Notice',
    message: 'Hello, this is a modal',
    actionElement: '',
    buttons: [
      {
        'label': 'OK',
        'action': 'hide'
      },
    ],
    extraButtons: [
    ],
  },
  
  defaultActionElement() {
    this.set('letUsKnowActionName','letUsKnow');
    var el = $('<span>Please <a>let us know</a>.</span>');
    var self = this;
    $(el).find('a').on('click',function(){
      self.sendAction('letUsKnowActionName');
    });
    return el;
  },
  
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
    
    this.set('defaults.actionElement',this.defaultActionElement());
    
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
    
    // Merge new options over defaults
    var options = Ember.Object.create(this.get('defaults'));
    options.setProperties(btnOptions);
    
    // Add extra buttons
    if( options.extraButtons ){
      options.buttons = options.extraButtons.concat(options.buttons);
    }
    
    // Add action HTML
    if( options.showAction ){
      if(options.message){
        options.message = options.message.trim();
        if( options.message.slice(-1) !== "." ){
          options.message += ".";
        }
      }
      this.$().find('.modal-action').prepend(options.actionElement);
    } else {
      this.$().find('.modal-action').html('');
    }
    
    this.setType( options.type );
    
    this.createButtons( options.buttons );
    
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
    if(newType==='warning') newType = 'error';
    
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
   * Buttons
   */
  
  createButtons(buttons) {
    
    if(buttons){
      
      var self = this;
      
      self.$().find('.modal-buttons').html(null);
      
      $.each(buttons,function(index,button){
        
        Ember.$('<a class="modal-button btn-a btn-a-white">' + button.label + '</a>').appendTo(self.$().find('.modal-buttons')).on('click',function(){
          
          if( button.action === 'hide' ){
            self.send('hide');
          } else {
            let actionName = button.action + 'Name';
            self.set(actionName,button.action);
            self.sendAction(actionName);
          }
        });
        
      });
      
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
