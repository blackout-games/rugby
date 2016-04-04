import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['confirm-button-wrapper'],
  timerIsGoing: false,
  rightGap: 20,
  
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
    
    let $confirm = this.$('.confirm-button-confirmation');
    let $original = this.$('.confirm-button-original');
    let $button = this.$('.confirm-button');
    let leftPadding = parseInt($button.css('padding-left'));
    let buttonHeight = parseInt($button.outerHeight());
    let rightGap = this.get('rightGap');
    
    Ember.Blackout.waitForSizeOfHidden($original,$button,(size)=>{
      
      let width = leftPadding*2 + size.width;
      this.set('originalWidth',width);
      $button.css({
        width: width + 'px',
        height: buttonHeight
      });
      this.$().css({
        width: (width + rightGap) + 'px',
      });
      
    });
    
    Ember.Blackout.waitForSizeOfHidden($confirm,$button,(size)=>{
      
      let width = size.width;
      let widthWithPadding = width + leftPadding*2;
      this.set('confirmWidth',width);
      $confirm.css('transform',`translate3d(${widthWithPadding}px,0,0)`);
      
    });
    
    let paddingLeft = $button.css('padding-left');
    let paddingRight = $button.css('padding-right');
    let paddingBottom = $button.css('padding-bottom');
    let paddingTop = $button.css('padding-top');
    
    $button.css('padding',0);
    $confirm.css('padding',`${paddingTop} 0 ${paddingBottom}`).addClass('center-parent');
    $original.css('padding',`${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`).addClass('center-parent');
    
  }),
  
  actions: {
    onClick(button){
    
      if(!this.get('timerIsGoing')){
        
        let $confirm = this.$('.confirm-button-confirmation');
        let $original = this.$('.confirm-button-original');
        let $button = this.$('.confirm-button');
        let $timer = this.$('.donut-timer');
        let width = this.get('confirmWidth');
        let rightGap = this.get('rightGap');
        let primaryTextColor = Ember.Blackout.getCSSColor('primary-text-color');
        let timerWidth = parseInt(Ember.Blackout.getCSSValue('width','donut-timer-go'));
        
        $button.css('width',width+'px');
        
        // Move text
        $confirm.css({
          transform: 'translateX(0px)',
          color: primaryTextColor,
        });
        $original.css('transform',`translateX(-${width}px)`);
        
        let $yes = this.$('.confirm-button-yes');
        let $no = this.$('.confirm-button-no');
        let gap = 7;
        let yesLeft = width + rightGap;
        let noLeft = yesLeft + $yes.outerWidth() + gap;
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
        });
        
        let wrapperWidth = timerLeft + timerWidth + rightGap;
        this.$().css('width',wrapperWidth);
        
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
      let rightGap = this.get('rightGap');
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
      
      this.$().css('width',width + rightGap);
      
      let button = this.get('button');
      button.enable();
      $button.addClass('reverse');
      let normalColor = Ember.Blackout.getCSSColor('btn-red');
      $button.css('background-color',normalColor);
      
      this.set('timerIsGoing',false);
      
    }
    
  },
  
});
