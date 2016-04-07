import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['confirm-button-wrapper'],
  timerIsGoing: false,
  
  /**
   * Gap between confirm and buttons, buttons and timer, timer and end of wrapper
   * @type {Number}
   */
  rightGap: Ember.computed('media.isMobile',function(){
    return this.get('media.isMobile') ? 11 : 15;
  }),
  
  /**
   * Gap between yes and no buttons
   * @type {Number}
   */
  buttonsGap: Ember.computed('media.isMobile',function(){
    return this.get('media.isMobile') ? 5 : 7;
  }),
  
  /**
   * The diamemter of the donut timer
   * @type {Number}
   */
  timerSize: Ember.computed('media.isMobile',function(){
    return this.get('media.isMobile') ? 30 : 35;
  }),
  
  onHide: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'isShowing')){
      if(!this.get('isShowing')){
        this.closeButton();
      }
    }
  }),
  
  setupClasses: Ember.on('init',function(){
    
    let classNames = this.get('class').split(' ');
    let passOnClassNames = [];
    
    Ember.$.each(classNames,(i,className)=>{
      if(className.substr(0,4)==='btn-'){
        passOnClassNames.push(className);
      }
    });
    
    Ember.run.scheduleOnce('afterRender',()=>{
      Ember.$.each(passOnClassNames,(i,className)=>{
        this.$().removeClass(className);
      });
    });
    
    this.set('buttonClass',passOnClassNames.join(' '));
    
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    this.renderButton();
    
  }),
  
  updateButton: Ember.observer('i18n.locale',function(){
    
    Ember.run.next(()=>{
      this.closeButton();
      this.renderButton();
    });
    
  }),
  
  renderButton(){
    
    let $confirm = this.$('.confirm-button-confirmation');
    let $original = this.$('.confirm-button-original');
    let $button = this.$('.confirm-button');
    let $yes = this.$('.confirm-button-yes');
    let $no = this.$('.confirm-button-no');
    let buttonHeight = parseInt($button.outerHeight());
    let rightGap = this.get('rightGap');
    let buttonsGap = this.get('buttonsGap');
    let timerSize = this.get('timerSize');
    let itemsWidth = 0;
    let itemsSized = 0;
    let itemsNeedingSizing = 3;
    let leftPadding;
    
    if(this.get('leftPadding')){
      leftPadding = this.get('leftPadding');
    } else {
      leftPadding = parseInt($button.css('padding-left'));
      this.set('leftPadding',leftPadding);
    }
    
    let setWrapperWidth = () => {
      
      let wrapperWidth = itemsWidth + buttonsGap + timerSize + rightGap*3;
      this.$().css('width',wrapperWidth);
      
    };
    
    Ember.Blackout.waitForSizeOfHidden($original,$button,(size)=>{
      
      let width = leftPadding*2 + size.width;
      this.set('originalWidth',width);
      $button.css({
        width: width + 'px',
        height: buttonHeight
      });
      $confirm.css('transform',`translate3d(${width}px,0,0)`);
      this.$().css({
        width: (width + rightGap) + 'px',
      });
      
    });
    
    Ember.Blackout.waitForSizeOfHidden($confirm,$button,(size)=>{
      
      let width = size.width;
      this.set('confirmWidth',width);
      
      itemsSized++;
      itemsWidth += width;
      if(itemsSized === itemsNeedingSizing){
        setWrapperWidth();
      }
      
    });
    
    Ember.Blackout.waitForSizeOfHidden($yes,(size)=>{
      
      let width = size.outerWidth;
      
      itemsSized++;
      itemsWidth += width;
      if(itemsSized === itemsNeedingSizing){
        setWrapperWidth();
      }
      
    });
    
    Ember.Blackout.waitForSizeOfHidden($no,(size)=>{
      
      let width = size.outerWidth;
      
      itemsSized++;
      itemsWidth += width;
      if(itemsSized === itemsNeedingSizing){
        setWrapperWidth();
      }
      
    });
    
    let paddingLeft = $button.css('padding-left');
    let paddingRight = $button.css('padding-right');
    let paddingBottom = $button.css('padding-bottom');
    let paddingTop = $button.css('padding-top');
    
    $button.css('padding',0);
    $confirm.css('padding',`${paddingTop} 0 ${paddingBottom}`).addClass('center-parent');
    $original.css('padding',`${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`).addClass('center-parent');
    
  },
  
  actions: {
    onClick(button){
    
      if(!this.get('timerIsGoing')){
        
        let $confirm = this.$('.confirm-button-confirmation');
        let $original = this.$('.confirm-button-original');
        let $button = this.$('.confirm-button');
        let $timer = this.$('.donut-timer');
        let originalWidth = this.get('originalWidth');
        let width = this.get('confirmWidth');
        let rightGap = this.get('rightGap');
        let primaryTextColor = Ember.Blackout.getCSSColor('primary-text-color');
        let timerSize = this.get('timerSize');
        let buttonsGap = this.get('buttonsGap');
        
        $button.css('width',width+'px');
        
        // Move text
        $confirm.css({
          transform: 'translateX(0px)',
          color: primaryTextColor,
        });
        $original.css('transform',`translateX(-${originalWidth}px)`);
        
        let $yes = this.$('.confirm-button-yes');
        let $no = this.$('.confirm-button-no');
        let yesLeft = width + rightGap;
        let noLeft = yesLeft + $yes.outerWidth() + buttonsGap;
        let timerLeft = noLeft + $no.outerWidth() + rightGap;
        
        $yes.css({
          transform: `translateX(${yesLeft}px)`,
          opacity: 1,
        });
        $no.css({
          transform: `translateX(${noLeft}px)`,
          opacity: 1,
        });
        $timer.css({
          transform: `translateX(${timerLeft}px)`,
          opacity: 1,
          width: timerSize + 'px',
          height: timerSize + 'px',
        });
        
        button.disable();
        $button.removeClass('reverse');
        $button.css('background-color','transparent');
        
        this.set('timerIsGoing',true);
        
        this.set('button',button);
        
      }
    },
    onYes(){
      this.closeButton();
      
      if( this.attrs.clickAction ){
        this.attrs.clickAction(this.get('button'));
      }
      
      this.set('loading',true);
    },
    onNo(){
      this.closeButton();
    },
    onTimerComplete(){
      this.closeButton();
    },
  },
  
  closeButton(){
    
    if(this.get('timerIsGoing')){
      
      let $confirm = this.$('.confirm-button-confirmation');
      let $original = this.$('.confirm-button-original');
      let $button = this.$('.confirm-button');
      let $timer = this.$('.donut-timer');
      let width = this.get('originalWidth');
      $button.css('width',width+'px');
      
      // Move text
      $original.css('transform','translateX(0px)');
      $confirm.css({
        transform: `translateX(${width}px)`,
        color: 'white',
      });
      
      let $yes = this.$('.confirm-button-yes');
      let $no = this.$('.confirm-button-no');
      
      $yes.css({
        transform: `translateX(0)`,
        opacity: 0,
      });
      $no.css({
        transform: `translateX(0)`,
        opacity: 0,
      });
      $timer.css({
        transform: `translateX(0)`,
        opacity: 0,
      });
      
      let button = this.get('button');
      button.enable();
      $button.addClass('reverse');
      let normalColor = Ember.Blackout.getCSSColor('btn-red');
      $button.css('background-color',normalColor);
      
      this.set('timerIsGoing',false);
      
    }
    
  },
  
});