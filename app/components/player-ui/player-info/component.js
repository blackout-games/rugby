import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  hasAppeared: false,
  
  energyChartOptions: {
    
    animation: false,

    // Number - Number of animation steps
    animationSteps: 50,
    
    //animationEasing: "easeOutBounce",
    animationEasing: "easeOutExpo",
    
  },
  
  setup: Ember.on('init','didRender',function(){
    
    // Since the chart settings are static, ember won't manage them between instances of this component, so we need to manually reset.
    this.set('energyChartOptions.animation',true);
    
    if( window.os.touchOS || !this.get('singleMode') ){
      this.set('energyChartOptions.animation',false);
    }
    
  }),
  
  /**
   * Determines when animation starts
   */
  waypointOffset: Ember.computed(function(){
    // Full window height means as soon as the waypoint appears at the *bottom* of the screen, the waypoint will fire.
    return Math.round($(window).height()) - (window.os.touchOS ? 111 : (this.get('media.isMobile') ? 111 : 333));
  }),
  
  actions: {
    handleWaypoint(direction){
      if(direction === 'down'){
        Ember.run.scheduleOnce('afterRender',this,function(){
          this.set('hasAppeared',true);
          this.set('hasAppearedBars',true);
        });
      }
    },
  },
  
  hasAppearedBars: Ember.computed('media.isMobile','media.isTablet','hasAppeared',function(){
    return true;
    // Turn off animations for squad view. Too annoying and hard to compare skills.
    /*if(this.get('hasAppeared') || window.os.touchOS){
      return true;
    } else {
      return false;
    }*/
  }),
  
  animateBars: Ember.computed('media.isMobile','media.isTablet',function(){
    return this.get('singleMode');
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
      return '19px';
    } else {
      return '29px';
    }
  }),
  
  chartComponent: Ember.computed('selectedTab',function(){
    
    let comp;
    
    if(this.get('waitForTab')){
      if(this.get('selectedTab') === this.get('waitForTab')){
        comp = 'ember-chart';
      }
    } else {
      comp = 'ember-chart';
    }
    
    if(comp){
      if(this.get('hasAnimatedChartOnce')){
        this.set('energyChartOptions.animation',false);
      } else {
        Ember.run.later(()=>{
          this.set('hasAnimatedChartOnce',true);
        },500);
      }
    }
    
    return comp;
  }),
  
  energyChartData: Ember.computed( 'player.energy', 'hasAppeared', 'selectedTab', 'chartComponent' , function(){
    
    if(!this.get('hasAppeared') && !window.os.touchOS){
      return;
    }
    
    // Hide any remaining tool tips
    Ember.Blackout.hideAllToolTips();
    
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
      highlight: "#e44d46",
      
      label: this.get('i18n').t('player.used-energy'),
    });
    
    // Add energy
    data.push({
      value: this.get('player.energy'),
      
      // Darker Red
      //color:"#c92e2e",
      //highlight: "#e63d3d",
      
      // Lighter red
      color:"#e44d46",
      highlight: "#f6665c",
      
      label: this.get('i18n').t('player.energy'),
    });
    
    return data;
    
  }),
  
});
