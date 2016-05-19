import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  classNames: ['blackout-form'],
  
  /**
   * An object describing form elements
   * See 'account' for example
   */
  form: [],
  
  inputSelector: 'form .touch-handler input, form .touch-handler label, form .touch-handler textarea, form .touch-handler select',
  inputSelectorRaw: 'form input:text, form input:password, form input[type="email"], form label:not(.x-toggle-btn), form textarea, form select',
  handlerSelector: '.touch-handler',
  
  setup: Ember.on('didInsertElement',function(){
    
    let inputSelector = this.get('inputSelector');
    let inputSelectorRaw = this.get('inputSelectorRaw');
    let handlerSelector = this.get('handlerSelector');
    
    if(window.os.touchOS){
      
      let getLabel = ($el)=>{
        var $label = $('label[for="'+$el.attr('id')+'"]');

        if($label.length <= 0) {
            var parentElem = $el.parent(),
                parentTagName = parentElem.get(0).tagName.toLowerCase();

            if(parentTagName === "label") {
                $label = parentElem;
            }
        }
        return $label;
      };
      
      // Surround inputs with touch handlers
      let $inputs = this.$(inputSelectorRaw);
      $inputs.each((i,el)=>{
        let $touchHandler = Ember.$('<div class="touch-handler"></div>');
        let $el = this.$(el);
        $touchHandler.insertBefore($el);
        $touchHandler.append($el);
      });
      
      // Prevent pointer events
      // This stops flickering when scrolling on touch devices
      let preventPointerEvents = ($input) => {
        if($input){
          if(!$input.is(":focus")){
            $input.css({
              'pointer-events': 'none',
              //'border': '2px solid #F0F', // For testing
            });
            let $label = getLabel($input);
            if($label){
              $label.css({
                'pointer-events': 'none',
                //'border': '2px solid #F0F', // For testing
              });
            }
          }
        } else {
          this.$(inputSelector).css({
            'pointer-events': 'none',
            //'border': '2px solid #F0F', // For testing
          });
        }
      };
      
      let restorePointerEvents = ($input) => {
        if($input){
          $input.css({
            'pointer-events': 'auto',
            //'border': '', // For testing
          });
        } else {
          this.$(inputSelector).css({
            'pointer-events': 'auto',
            //'border': '', // For testing
          });
        }
      };
      
      preventPointerEvents();
      
      // Force fast focus | use touchend for mobile so that we can still drag scrollable forms. Touchend still saves some time as sometimes there is a delay before the click event fires.
      this.$(handlerSelector).on('touchend',(e)=>{
        let $el = $(e.currentTarget);
        let $input = $el.find('input, textarea, select');
        if($input.prop("tagName")==='SELECT'){
          return;
        }
        if($el.data('can-focus')){
          
          let wasPrevented = $input.data('was-prevented-on-start');
          
          restorePointerEvents($input);
          if(!$input.is(":focus") && !e.originalEvent.isManual){
            
            Ember.run.next(()=>{
              //$input.putCursorAtEnd(); // Also adds focus
              
              /**
               * Run for all so we can switch easy
               * We run in next runloop to get inputs which were
               * blurred as a result of this one being focused
               */
              restorePointerEvents();
            });
            
            $input.focus();
            
            if(wasPrevented){
              
              if(!$input.data('hasFocusedOnce')){
                $input.putCursorAtEnd();
                $input.data('hasFocusedOnce',true);
              }
              
              // Run mousedown, mouseup, and click events here
              // Once we have focus, attempt to put the cursor where we touched
              // Working on iOS 9.3.2 Safari (Only when debugging though?)
              // Working on iOS Chrome 50
              Ember.Blackout.runManualEvent(e,'touchstart');
              Ember.Blackout.runManualEvent(e,'touchend');
              Ember.Blackout.runManualEvent(e,'mousedown');
              Ember.Blackout.runManualEvent(e,'mouseup');
              Ember.Blackout.runManualEvent(e,'click');
              
            }
            
          }
        }
      });
      this.$(handlerSelector).on('touchstart',(e)=>{
        let $el = $(e.currentTarget);
        let $input = $el.find('input, textarea, select');
        if($input.prop("tagName")==='SELECT'){
          return;
        }
        let wasPrevented = $input.css('pointer-events') === 'none';
        $input.data('was-prevented-on-start',wasPrevented);
        $el.data('can-focus',true);
        preventPointerEvents($input);
      });
      this.$(handlerSelector).on('touchmove',(e)=>{
        let $el = $(e.currentTarget);
        $el.data('can-focus',false);
      });
      this.$(inputSelector).on('blur',()=>{
        preventPointerEvents();
        Ember.$('body').off('touchstart',this.removeFocus);
      });
      /**
       * This allows the inputs so still be selected manually elsewhere
       * e.g. auto-selecting all text in player-ui/export
       */
      this.$(inputSelector).on('focus',(e)=>{
        let $input = $(e.currentTarget);
        restorePointerEvents($input);
        
        Ember.run.next(()=>{
          Ember.$('body').on('touchstart',$input,this.removeFocus);
        });
      });
      
    } else {
      
      // Force fast focus
      this.$(inputSelector).on('mousedown',(e)=>{
        let $el = $(e.target);
        $el.focus();
      });
      
    }
    
  }),

  removeFocus(e){
    let $input = e.data;
    let tagName = Ember.$(e.target).prop("tagName");
    if(tagName!=='INPUT' && tagName!=='TEXTAREA' && tagName!=='LABEL'){
      $input.blur();
    }
  },
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    let inputSelector = this.get('inputSelector');
    let handlerSelector = this.get('handlerSelector');
    
    this.$(handlerSelector).off('mousedown touchstart touchmove touchend');
    this.$(inputSelector).off('blur focus');
    Ember.$('body').off('touchstart',this.removeFocus);
    
  }),
  
  computedForm: Ember.computed('form',function(){
    
    let form = this.get('form');
    if(form){
      Ember.$.each(form,(key,item)=>{
        
        // Set default type if not given
        if(!item.type){
          item.type = 'text';
        }
        
      });
    }
    
    return form;
    
  }),
  
  resetModel: Ember.on('willDestroyElement',function(){
    
    if(this.get('model') && this.get('model').rollbackAttributes){
      this.get('model').rollbackAttributes();
    }
    
  }),
  
  hasValidations: Ember.computed.alias('model.validations'),
  formIsValid: Ember.computed.alias('model.validations.isValid'),
  
  serverErrors: {},
  
  resetErrors(){
    this.set('serverError',null);
    this.set('serverErrors',{});
  },
  
  actions: {
    onSave(button){
      this.set('hasValidated',true);
      // Check if validation is all g.
      if(!this.get('hasValidations') || this.get('formIsValid')){
        if(this.attrs.onSave){
          this.$('.blackout-cancel-button').prop('disabled',true);
          
          /**
           * Send 3 functions to action
           * action( succeed, fail, final ){}
           */
          this.attrs.onSave((dontAnimate=false)=>{
            
            this.resetErrors();
            button.succeed(true,dontAnimate);
            this.$('.blackout-cancel-button').prop('disabled',false);
            
          },(error)=>{
            
            this.resetErrors();
            
            let errObject = Ember.Object.create(error);
            
            let item = errObject.get('errors.item');
            
            if(item){
              this.set('serverErrors.'+item,errObject.get('errors'));
            } else {
              this.set('serverError',errObject.get('errors.title'));
            }
            
            button.reset(false,true);
            this.$('.blackout-cancel-button').prop('disabled',false);
            
          },(forceReset)=>{
            // Don't reset here, since if the consumer has nested promises, and calls this function in the finally clause on the parent promise, it will execute to early.
            // Plus we have different button animation for success
            
            if(forceReset){
              button.reset(true,true);
            }
          });
          
        }
      } else {
        button.reset();
      }
      
      this.set('button',button);
    },
    onCancel(){
      
      // Reset the form
      //this.$('form')[0].reset();
      // We must also check if the model is new, because calling rollbackAttrs on a new model will delete it from the store
      if(this.get('model').rollbackAttributes && !this.get('model.isNew')){
        this.get('model').rollbackAttributes();
      }
      
      if(this.attrs.onCancel){
        this.attrs.onCancel();
      }
    },
    toggleItem(id){
      let item = this.get('linksShowing.'+id);
      if(item){
        this.set('linksShowing.'+id,false);
      } else {
        this.set('linksShowing.'+id,true);
      }
    },
  },
  
  linksShowing: Ember.Object.create(),
  
  handleOnAndOffScreen: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'isOnScreen') && !this.get('isOnScreen')){
      this.send('onCancel');
    }
    if(this.attrChanged(opts,'isOnScreen') && this.get('isOnScreen') && this.get('button')){
      this.get('button').reset(false,true);
    }
  }),
  
});
