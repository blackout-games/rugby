import Ember from 'ember';
const { $ } = Ember;

/*Chart.defaults.global.customTooltips = function(tooltip) {
  // Tooltip Element
    var tooltipEl = $('#chartjs-tooltip');
    // Hide if no tooltip
    if (!tooltip) {
        tooltipEl.css({
            opacity: 0
        });
        return;
    }
    // Set caret Position
    tooltipEl.removeClass('above below');
    tooltipEl.addClass(tooltip.yAlign);
    // Set Text
    tooltipEl.html(tooltip.text);
    // Find Y Location on page
    var top;
    if (tooltip.yAlign == 'above') {
        top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
    } else {
        top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
    }
    // Display, position, and set styles for font
    tooltipEl.css({
        opacity: 1,
        left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
        top: tooltip.chart.canvas.offsetTop + top + 'px',
        fontFamily: tooltip.fontFamily,
        fontSize: tooltip.fontSize,
        fontStyle: tooltip.fontStyle,
    });
};*/

export default Ember.Component.extend({
  
  classNames: ['show-overflow'],
  
  hasAppeared: false,
  
  hasAppearedBars: Ember.computed('media.isMobile','media.isTablet','hasAppeared',function(){
    if(this.get('hasAppeared') || window.os.touchOS){
      return true;
    } else {
      return false;
    }
  }),
  
  animateBars: Ember.computed('media.isMobile','media.isTablet',function(){
    return !window.os.touchOS;
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
  
  /**
   * Determines when animation starts
   */
  waypointOffset: Ember.computed(function(){
    // Full window height means as soon as the waypoint appears at the *bottom* of the screen, the waypoint will fire.
    return Math.round($(window).height()) - (window.os.touchOS ? 111 : 333);
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
  
  setup: Ember.on('init',function(){
    
    if( window.os.touchOS ){
      this.set('energyChartOptions.animation',false);
    }
    
  }),
  
  energyChartOptions: {
    
    animation: true,

    // Number - Number of animation steps
    animationSteps: 50,
    
    //animationEasing: "easeOutBounce",
    animationEasing: "easeOutExpo",
    
  },
  
  energyChartData: Ember.computed( 'player.energy', 'hasAppeared', function(){
    
    if(!this.get('hasAppeared') && !window.os.touchOS){
      return;
    }
    
    let data = [];
    //color: "#FDB45C", // Yellow
    //highlight: "#FFC870",
    //color:"#F7464A", // Red
    //highlight: "#FF5A5E",
    
    // Add used energy
    data.push({
      value: 100 - this.get('player.energy'),
      color:Ember.Blackout.getCSSValue('background-color','bg-light'),
      highlight: "#FF5A5E",
      label: this.get('i18n').t('player.used-energy'),
    });
    
    // Add energy
    data.push({
      value: this.get('player.energy'),
      color:"#FDB45C",
      highlight: "#FFC870",
      label: this.get('i18n').t('player.energy'),
    });
    
    return data;
    
  }),
  
});
