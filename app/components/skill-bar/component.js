import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  width: '100%',
  height: '33px',
  level: 0,
  max: 100,
  hasAppeared: true,
  animate: true,
  animateNumber: false,
  notVertMode: Ember.computed.not('vertMode'),
  
  setupBinds: Ember.on('init',function(){
    this.animateNumberStepBound = Ember.run.bind(this,this.animateNumberStep);
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('animate')){
      this.$('.skill-bar').addClass('skill-bar-animate');
    }
    
    Ember.run.once(this,this.updateBar);
    
  }),
  
  handleUpdate: Ember.on('didUpdateAttrs',function(){
    
    // Set number at 1
    this.set('currentNumber',1);
    this.set('displayLevel',1);
    
    Ember.run.once(this,this.updateBar);
    
  }),
  
  updateBar(){
    
    this.$().css('width',this.get('width'));
    this.$('.skill-bar-placeholder').css('height',this.get('height'));
    
    if(this.get('primarySkill')){
      
      let level = this.get('level');
      let color = '';
      
      // Set color based on level
      if( level < 10 ){
        color = 'dark-blue';
      } else if( level < 20 ){
        color = 'blue';
      } else if( level < 30 ){
        color = 'teal';
        color = 'green';
      } else if( level < 39 ){
        color = 'green';
      } else if( level < 44 ){
        color = 'yellow';
      } else if( level < 48 ){
        color = 'red';
      } else {
        color = 'purple';
      }
      
      
      this.$('.skill-bar').removeClass(function (index, css) {
        return (css.match (/(^|\s)skill-bar-color-\S+/g) || []).join(' ');
      });
      this.$('.skill-bar').addClass('skill-bar-color-'+color);
      
      if(this.get('icon')){
      
        this.$('.skill-bar-icon-inner > i').addClass('icon-skill-'+this.get('icon'));
        
      }
      
      if(this.get('vertMode')){
        this.$('.skill-bar-label-number').removeClass(function (index, css) {
          return (css.match (/(^|\s)text-color-\S+/g) || []).join(' ');
        });
        this.$('.skill-bar-label-number').addClass('text-color-'+color);
      }
      
    } else if(this.get('barColor')){
      
      this.$('.skill-bar').css('background-color',this.get('barColor'));
      
    }
    
    if(this.get('hasAppeared')){
      
      if( this.get('animate') ){
        
        Ember.run.next(() => {
          this.$('.skill-bar').css({
            height: this.get('height'),
            opacity: 1,
          });
          
          let w = this.get('level')/this.get('max');
          
          // Remove element-level css shadow
          this.$('.skill-bar').css('box-shadow','');
          
          // Get shadow (glow)
          let shadow = this.$('.skill-bar').css('box-shadow');
          
          if(shadow!=='none'){
            
            shadow = shadow.replace(/[0-9]+px [0-9]+px ([0-9]+px) [0-9]+px/,( fullMatch, blur)=>{
              
              // Make bigger for wide skill bars
              blur = parseInt(blur)*2;
              
              return '0px 0px ' + Math.round(parseInt(blur)/w) + 'px 0px';
            });
            
            this.$('.skill-bar').css('box-shadow',shadow);
            
          }
          
          this.$('.skill-bar').css('transform','scale3d('+w+',1,1)').addClass('animatable');
          
        });
        
      } else {
            
        let w = Math.round(this.get('level')/this.get('max')*100) + '%';
        
        this.$('.skill-bar').addClass('skill-bar-no-animate');
        this.$('.skill-bar').css({
          height: this.get('height'),
          width: w,
        });
        
        //let w = this.get('level')/this.get('max');
          
        //this.$('.skill-bar').css('transform','scale3d('+w+',1,1)').addClass('animatable');
        
      }
      
      if( this.get('animateNumber') ){
        this.startAnimatingNumber();
      } else {
        this.set('displayLevel',this.get('level'));
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
    this.set('displayLevel',currentNumber);
    
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
