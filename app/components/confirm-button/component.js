import Ember from 'ember';

export default Ember.Component.extend({
  
  classNames: ['confirm-button-wrapper'],
  
  rightGap: 5,
  
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
      
      let $confirm = this.$('.confirm-button-confirmation');
      let $original = this.$('.confirm-button-original');
      let $button = this.$('.confirm-button');
      let width = this.get('confirmWidth');
      let rightGap = this.get('rightGap');
      let primaryTextColor = Ember.Blackout.getCSSColor('primary-text-color');
      
      
      $button.css('width',width+'px');
      
      // Move text
      $confirm.css({
        transform: 'translate3d(0px,0,0)',
        color: primaryTextColor,
      });
      $original.css('transform',`translate3d(-${width}px,0,0)`);
      
      let $yes = this.$('.confirm-button-yes');
      let $no = this.$('.confirm-button-no');
      let gap = 7;
      let yesLeft = width + gap*3;
      let noLeft = yesLeft + $yes.outerWidth() + gap;
      
      $yes.css({
        transform: `translate3d(${yesLeft}px,0,0)`,
        opacity: 1,
      });
      $no.css({
        transform: `translate3d(${noLeft}px,0,0)`,
        opacity: 1,
      });
      
      let wrapperWidth = noLeft + rightGap + $no.outerWidth();
      this.$().css('width',wrapperWidth);
      
      button.disable();
      $button.css('background-color','transparent');
      
      this.set('button',button);
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
  },
  
  closeButton(){
    
    let $confirm = this.$('.confirm-button-confirmation');
    let $original = this.$('.confirm-button-original');
    let $button = this.$('.confirm-button');
    let width = this.get('originalWidth');
    let rightGap = this.get('rightGap');
    $button.css('width',width+'px');
    
    // Move text
    $original.css('transform','translate3d(0px,0,0)');
    $confirm.css({
      transform: `translate3d(${width}px,0,0)`,
      color: 'white',
    });
    
    let $yes = this.$('.confirm-button-yes');
    let $no = this.$('.confirm-button-no');
    
    $yes.css({
      transform: `translate3d(0,0,0)`,
      opacity: 0,
    });
    $no.css({
      transform: `translate3d(0,0,0)`,
      opacity: 0,
    });
    
    this.$().css('width',width + rightGap);
    
    let button = this.get('button');
    button.enable();
    let normalColor = Ember.Blackout.getCSSColor('btn-red');
    $button.css('background-color',normalColor);
    
  },
  
});
