import Ember from 'ember';
//const { $ } = Ember;

export default Ember.Component.extend({
  
  isOnScreen: true,
  
  donutChartOptions: Ember.computed('singleMode','media.isMobile',function(){
    
    let opts = {
      
      animation: false,

      // Number - Number of animation steps
      animationSteps: 50,
      
      //animationEasing: "easeOutBounce",
      animationEasing: "easeOutExpo",
      
      // Thickness
      percentageInnerCutout: 38,

      showTooltips: false,
      
    };
    
    if( this.get('media.isMobile') ){
      if(this.get('singleMode')){
        opts.percentageInnerCutout = 33;
      } else {
        opts.percentageInnerCutout = 33;
      }
    } else {
      if(this.get('singleMode')){
        opts.percentageInnerCutout = 33;
      } else {
        opts.percentageInnerCutout = 33;
      }
    }
    
    return opts;
    
  }),
  
  donutChartSize: Ember.computed('media.isMobile',function(){
    if( this.get('media.isMobile') ){
      if(this.get('singleMode')){
        return 70;
      } else {
        return 59;
      }
    } else {
      if(this.get('singleMode')){
        return 90;
      } else {
        return 77;
      }
    }
  }),
  
  setupInit: Ember.on('init',function(){
    this.resetChartOptions();
  }),
  
  onNewPlayer: Ember.on('didUpdateAttrs',function(opts){
    if(this.attrChanged(opts,'player')){
      this.resetChartOptions();
    }
  }),
  
  setup: Ember.on('didInsertElement',function(){
    if(!this.get('singleMode')){
      Ember.run.once(this,this.updateChartData);
      //Ember.run.debounce(this,this.updateChartData,1);
    }
    Ember.run.scheduleOnce('afterRender', this, ()=>{
      this.notifyPropertyChange('hasRendered');
    });
  }),
  
  flatCSR: Ember.computed('media.@each','hasRendered',function(){
    
    if(this.$() && this.$().length){
      
      // Can we display flat csr?
      let labelWidth = this.$('.csr-label').outerWidth();
      let csrWidth = this.$('.player-ui-csr-value').outerWidth();
      let csrChangeWidth = this.$('.csr-change').outerWidth();
      let wrapperWidth = this.$('.player-ui-csr-wrapper').outerWidth();
      let offset = 25;
      
      // Extra offset needed for mobile browsers
      if(this.get('player.isInjured') || this.get('player.isForSale')){
        offset += 25;
      }
      
      let totalContentWidth = labelWidth + csrWidth + csrChangeWidth + offset;
      
      return totalContentWidth < wrapperWidth;
    }
    return false;
    
  }),
  
  resetChartOptions(){
    // Since the chart settings are static, ember won't manage them between instances of this component, so we need to manually reset.
    //this.set('donutChartOptions.animation',true);
    
    if( window.os.touchOS || !this.get('singleMode') ){
      this.set('donutChartOptions.animation',false);
    }
    
    this.set('hasAnimatedChartOnce',false);
  },
  
  isTouchOS: Ember.computed(function(){
    return window.os.touchOS;
  }),
  
  animateBars: Ember.computed('media.isMobile','media.isTablet',function(){
    return this.get('singleMode') && !window.os.touchOS;
    // Turn off animations for squad view. Too annoying and hard to compare skills.
    //return !window.os.touchOS;
  }),
  
  attrBarHeight: Ember.computed('media.isMobile',function(){
    if(this.get('media.isMobile')){
      return '8px';
    } else {
      return '11px';
    }
  }),
  
  skillBarHeight: Ember.computed('media.isMobile',function(){
    if(this.get('media.isMobile')){
      if(this.get('singleMode')){
        return '29px';
      } else {
        return '22px';
      }
    } else {
      if(this.get('singleMode')){
        return '33px';
      } else {
        return '29px';
      }
    }
  }),
  
  traitBarColor: Ember.computed(function(){
    //return '#367cd6';
    return null;
  }),
  
  donutChartSizeStyle: Ember.computed('media.isMobile',function(){
    return Ember.String.htmlSafe(`min-width: ${this.get('donutChartSize')}px;`);
  }),
  
  updateChart: Ember.on('didReceiveAttrs',function(opts){
    if((this.attrChanged(opts,'isOnScreen') || this.attrChanged(opts,'player')) && this.get('isOnScreen')){
      
      // Wait to make sure we've rendered the base, before rendering a new chart
      if(this.get('singleMode')){
        Ember.run.debounce(this,this.updateChartData,1);
      } else {
        Ember.run.once(this,this.updateChartData);
        //Ember.run.debounce(this,this.updateChartData,1);
      }
    }
  }),
  
  updateChartData(){
    
    this.set('chartComponent','blackout-chart');
    
    if(this.get('hasAnimatedChartOnce')){
      this.set('donutChartOptions.animation',false);
    } else {
      this.set('hasAnimatedChartOnce',true);
    }
    
    // Hide any remaining tool tips
    Ember.Blackout.hideAllToolTips();
    
    // ------------------------------------- ENERGY
    
    
    let data = [];
    //color: "#FDB45C", // Yellow
    //highlight: "#FFC870",
    //color:"#F7464A", // Red
    //highlight: "#FF5A5E",
    
    // Add used energy
    data.push({
      value: 100 - this.get('player.energy'),
      
      // Darker Red
      //color:"#c92e2e",
      //highlight: "#e63d3d",
      
      // Lighter Red
      //color:"#e44d46",
      //highlight: "#f6665c",
      
      // Secondary color
      color:Ember.Blackout.getCSSColor('bg-light'),
      //highlight: "#e44d46",
      
      label: this.get('i18n').t('player.used-energy'),
    });
    
    let color = tinycolor(Ember.Blackout.getCSSColor('bg-skillbar-red'));
    //let color = tinycolor(Ember.Blackout.getCSSColor('bg-skillbar-blue'));
    let diff = 0.22;
    let sat = 0.74;
    let brightness = 0.57;
    
    let b1 = brightness + 1.1*diff;
    let b2 = brightness + 0.2*diff;
    let b3 = brightness - 0.2*diff;
    let b4 = brightness - 0.7*diff;
    
    // Match red skill bar
    let hue = color.toHsl().h;
    let energy1 = tinycolor(`hsl ${hue} ${sat} ${b1}`).toHexString();
    let energy2 = tinycolor(`hsl ${hue} ${sat} ${b2}`).toHexString();
    let energy3 = tinycolor(`hsl ${hue} ${sat} ${b3}`).toHexString();
    let energy4 = tinycolor(`hsl ${hue} ${sat} ${b4}`).toHexString();
    
    
    // Add energy
    data.push({
      value: this.get('player.energy'),
      
      // Darker Red
      //color:"#c92e2e",
      //highlight: "#e63d3d",
      
      // Lighter red
      //color:"#e44d46",
      //highlight: "#f6665c",
      
      // Gradient
      color: (ctx)=>{
        var gradient1 = ctx.createLinearGradient(0, 0, 0, this.get('donutChartSize'));
        gradient1.addColorStop(0.0, energy1);
        gradient1.addColorStop(0.5, energy2);
        gradient1.addColorStop(0.51, energy3);
        gradient1.addColorStop(1.0, energy4);
        return gradient1;
      },
      
      label: this.get('i18n').t('player.energy'),
    });
    
    this.set('energyChartData',data);
    
    
    // ------------------------------------- FORM
    
    color = tinycolor(Ember.Blackout.getCSSColor('bg-skillbar-dark-blue'));
    diff = 0.22;
    sat = 0.74;
    brightness = 0.57;
    
    b1 = brightness + 1.1*diff;
    b2 = brightness + 0.2*diff;
    b3 = brightness - 0.2*diff;
    b4 = brightness - 0.7*diff;
    
    // Match red skill bar
    hue = color.toHsl().h;
    let form1 = tinycolor(`hsl ${hue} ${sat} ${b1}`).toHexString();
    let form2 = tinycolor(`hsl ${hue} ${sat} ${b2}`).toHexString();
    let form3 = tinycolor(`hsl ${hue} ${sat} ${b3}`).toHexString();
    let form4 = tinycolor(`hsl ${hue} ${sat} ${b4}`).toHexString();
    
    
    let formData = [];
    
    formData.push({
      value: 100 - this.get('player.form'),
      
      // Secondary color
      color:Ember.Blackout.getCSSColor('bg-light'),
    });
    
    // Add form
    formData.push({
      value: this.get('player.form'),
      
      //color:Ember.Blackout.getCSSColor('bg-dark-lighter-3x'),
      //color:'#3D73D6',
      
      // Gradient (full blue)
      color: (ctx)=>{
        var gradient1 = ctx.createLinearGradient(0, 0, 0, this.get('donutChartSize'));
        gradient1.addColorStop(0.0, form1);
        gradient1.addColorStop(0.5, form2);
        gradient1.addColorStop(0.51, form3);
        gradient1.addColorStop(1.0, form4);
        return gradient1;
      },
      
      // Gradient (Faded secondary)
      /*color: (ctx)=>{
        var gradient1 = ctx.createLinearGradient(0, 0, 0, this.get('donutChartSize'));
        gradient1.addColorStop(0.0, '#a7b6dd');
        gradient1.addColorStop(0.5, '#6479b7');
        gradient1.addColorStop(0.51, '#4e67ac');
        gradient1.addColorStop(1.0, '#354981');
        return gradient1;
      },*/
      
      
      label: this.get('i18n').t('player.form'),
    });
    
    this.set('formChartData',formData);
    
    /**
     * On chrome, if you go to player page, then back to squad, on retina
     * Sometimes the charts will disappear after about 700ms??
     * We fix by redrawing from 700-1200ms later
     * @type {Boolean}
     */
    let isFixing = this.get('cache.chromeWorkaround');
    if(!isFixing && window.browsers.chrome && !this.get('singleMode')){
      this.set('cache.chromeWorkaround',true);
      Ember.run.later(()=>{
        this.set('cache.chromeWorkaround',false);
        if(!this.get('isDestroyed')){
          this.$().hide().show(0);
          Ember.run.later(()=>{
            if(!this.get('isDestroyed')){
              this.$().hide().show(0);
              Ember.run.later(()=>{
                if(!this.get('isDestroyed')){
                  this.$().hide().show(0);
                  Ember.run.later(()=>{
                    if(!this.get('isDestroyed')){
                      this.$().hide().show(0);
                      Ember.run.later(()=>{
                        if(!this.get('isDestroyed')){
                          this.$().hide().show(0);
                          Ember.run.later(()=>{
                            if(!this.get('isDestroyed')){
                              this.$().hide().show(0);
                            }
                          },100);
                        }
                      },100);
                    }
                  },100);
                }
              },100);
            }
          },100);
        }
      },700);
    }
    
  },
  
});
