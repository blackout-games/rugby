import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  width: '100%',
  height: '33px',
  level: 0,
  max: 100,
  animate: true,
  notVertMode: Ember.computed.not('vertMode'),
  colorClass: '',
  
  setup: Ember.on('didInsertElement',function(){
    
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
      
      this.set('colorClass','skill-bar-color-'+color);
      
      if(this.get('icon')){
        this.set('iconClass','icon-skill-'+this.get('icon'));
      }
      
      if(this.get('vertMode')){
        this.set('textClass','text-color-'+color);
      }
      
    } else if(this.get('barColor')){
      
      this.$('.skill-bar').css('background-color',this.get('barColor'));
      
    }
      
    if( this.get('animate') ){
      
      this.set('animateClass','skill-bar-animate');
      
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
        
        if(shadow && shadow!=='none'){
          
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
      
      this.$('.skill-bar').css({
        height: this.get('height'),
        width: w,
      });
      
    }
    
  },
  
});
