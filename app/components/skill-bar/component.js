import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  classNames: ['skill-bar-wrapper','vc-parent','row'],
  width: '100%',
  height: '33px',
  level: 0,
  max: 100,
  hasAppeared: true,
  animate: true,
  animateNumber: false,
  numberSizeMobile: '17px',
  numberSize: '19px',
  
  setupBinds: Ember.on('init',function(){
    this.animateNumberStepBound = Ember.run.bind(this,this.animateNumberStep);
  }),
  
  setup: Ember.on('didRender',function(){
    
    this.$().css('width',this.get('width'));
    this.$('.skill-bar-placeholder').css('height',this.get('height'));
    
    if(this.get('numberSizeMobile') && this.get('media.isMobile')){
      this.$('.skill-bar-number').css('font-size',this.get('numberSizeMobile'));
    }
    if(this.get('numberSize') && !this.get('media.isMobile')){
      this.$('.skill-bar-number').css('font-size',this.get('numberSize'));
    }
    
    if(!this.get('animate')){
      this.updateBar();
    }
    
  }),
  
  handleUpdate: Ember.on('didUpdateAttrs',function(){
    
    // Set number at 1
    this.set('currentNumber',1);
    this.$('.skill-bar-number').html('1');
    
    this.updateBar();
    
  }),
  
  updateBar(){
    
    if(this.get('hasAppeared')){
      
      let w = Math.round(this.get('level')/this.get('max')*100) + '%';
      
      if( this.get('animate') ){
        
        Ember.run.next(() => {
          this.$('.skill-bar').css({
            height: this.get('height'),
            //width: w,
            opacity: 1,
          });
          
          this.$('.skill-bar').stop().animate({
            'width': w
          },1111,'easeOutExpo');
        });
        
      } else {
        
        this.$('.skill-bar').addClass('skill-bar-no-animate');
        this.$('.skill-bar').css({
          height: this.get('height'),
          width: w,
        });
        
      }
      
      if( this.get('animateNumber') ){
        this.startAnimatingNumber();
      } else {
        this.$('.skill-bar-number').html(this.get('level'));
      }
      
    }
    
    if(this.get('level')<=0){
      this.$('.skill-bar').addClass('skill-bar-no-outline');
    } else {
      this.$('.skill-bar').removeClass('skill-bar-no-outline');
    }
    
  },
  
  startAnimatingNumber(){
    
    // Start interval
    let intervalTime = 1111 / this.get('level');
    let numberStep = 1;
    if(intervalTime < 10){
      intervalTime = 10;
      numberStep = Math.ceil(this.get('level') / (1111/10));
    } else {
      intervalTime = Math.round(intervalTime);
    }
    
    this.set('numberStep',numberStep);
    
    this.set('intervalId',window.setInterval(this.animateNumberStepBound,intervalTime));
    
  },
  
  animateNumberStep(){
    
    let currentNumber = this.get('currentNumber');
    
    if(currentNumber < this.get('level')){
      
      currentNumber += this.get('numberStep');
      
      if( currentNumber >= this.get('level') ){
        currentNumber = this.get('level');
      }
      
    }
    
    this.set('currentNumber',currentNumber);
    this.$('.skill-bar-number').html(currentNumber);
    
    if(Number(currentNumber)===Number(this.get('level')) && this.get('intervalId')){
      
      window.clearInterval(this.get('intervalId'));
      this.set('intervalId',false);
      
    }
    
  },
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    if(this.get('intervalId')){
      
      window.clearInterval(this.get('intervalId'));
      
    }
    
  }),
  
});
