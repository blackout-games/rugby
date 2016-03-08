import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  classNames: [],
  
  reactToAttrs: Ember.on('didReceiveAttrs',function(options){
    
    if(this.attrChanged(options,'tabPanels')){
      this.buildTabs();
    }
    
  }),
  
  selectTab(id,$tab){
    this.set('selectedTab',id);
    this.$('.blackout-tabs-slider-tab').removeClass('active');
    $tab.addClass('active');
  },
  
  buildTabs(){
    
    let defaultId,$defaultTab;
    
    // Clear out any old tabs
    this.$('.blackout-tabs-slider').html('');
    
    // Build new ones
    $.each(this.get('tabPanels'),(i,$panel)=>{
      
      let $tab;
      
      // Build tab
      if($panel.data('tab-icon-class')){
        $tab = $('<a class="vc-parent blackout-tabs-slider-tab col-fixed no-webkit-highlight no-hover"><div class="vc-child"><div class="text-center"><i class="' + $panel.data('tab-icon-class') + ' blackout-tabs-icon icon-vcenter"></i></div><div class="text-center ellipses">' + $panel.data('tab-name') + '</div></div></a>');
      } else {
        $tab = $('<a>' + $panel.data('tab-name') + '</a>');
      }
      
      // Handle tab click
      //$tab.on('mousedown touchstart',()=>{
      $tab.on('mousedown',()=>{
        this.selectTab($panel.prop('id'),$tab);
      });
      
      // Handle touch devices
      let canClick = false;
      $tab.on('touchstart',()=>{
        Ember.run.later(()=>{
          if(canClick){
            this.selectTab($panel.prop('id'),$tab);
          }
        },77);
        canClick = true;
      });
      $tab.on('touchmove',()=>{
        canClick = false;
      });
      
      // Add tab to DOM
      this.$('.blackout-tabs-slider').append($tab);
      this.$('.blackout-tabs-slider').append(' ');
      
      if(!defaultId){
        defaultId = $panel.prop('id');
        $defaultTab = $tab;
      }
      
    });
    
    // Add end
    this.$('.blackout-tabs-slider').append($('<div class="col-fixed blackout-tabs-slider-end"></div>'));
    
    this.$('.blackout-tabs-slider').off('touchstart touchmove touchend').on('touchstart touchmove touchend',(e)=>{
      e.stopPropagation();
    });
    
    // Select default
    this.selectTab(defaultId,$defaultTab);
    
    /**
     * Slider animation
     */
    
    let globalID, animationBaseTime = 1111;
    
    if(!window.os.touchOS){
      
      // Show buttons on mouse enter based on current scrollability
      this.$('.blackout-tabs-slider-hider').on('mouseenter',()=>{
        
        if(this.canScrollLeft()){
          this.$('.blackout-tabs-slider-button.left').stop().fadeIn(222);
        }
        
        if(this.canScrollRight()){
          this.$('.blackout-tabs-slider-button.right').stop().fadeIn(222);
        }
        
      });

      let repeatOften = ()=>{
        globalID = requestAnimationFrame(repeatOften);
        if(this.canScrollLeft()){
          this.$('.blackout-tabs-slider-button.left').stop().fadeIn(222);
        } else {
          this.$('.blackout-tabs-slider-button.left').stop().fadeOut(222);
        }
        if(this.canScrollRight()){
          this.$('.blackout-tabs-slider-button.right').stop().fadeIn(222);
        } else {
          this.$('.blackout-tabs-slider-button.right').stop().fadeOut(222);
        }
      };
      
      let stopAnimating = ()=>{
        cancelAnimationFrame(globalID);
        this.$('.blackout-tabs-slider-scroller').stop();
      };
      
      // Hide buttons on mouseout
      this.$('.blackout-tabs-slider-hider').on('mouseleave',(e)=>{
        if( !$(e.relatedTarget).hasClass('blackout-tabs-slider-button') && !$(e.relatedTarget).hasParent('.blackout-tabs-slider-button') ){
          this.$('.blackout-tabs-slider-button').stop().fadeOut(222);
          stopAnimating();
        }
      });
      
      // Hide buttons on mouse wheel
      this.$('.blackout-tabs-slider-scroller').on('mousewheel',()=>{
        this.$('.blackout-tabs-slider-button').stop().fadeOut(222);
        stopAnimating();
      });
      
      // Hide buttons on mouseout from buttons
      this.$('.blackout-tabs-slider-button').on('mouseleave',(e)=>{
        if( !$(e.relatedTarget).hasClass('blackout-tabs-slider-hider') && !$(e.relatedTarget).hasParent('.blackout-tabs-slider-hider') ){
          this.$('.blackout-tabs-slider-button').stop().fadeOut(222);
          stopAnimating();
        }
      });
      
      // React to button press
      this.$('.blackout-tabs-slider-button.right').on('mousedown',()=>{
        let scrollLeft = this.$('.blackout-tabs-slider-scroller')[0].scrollLeft;
        let scrollMax = this.$('.blackout-tabs-slider')[0].scrollWidth - this.$('.blackout-tabs-slider-scroller').width();
        let scrollTime = (scrollMax-scrollLeft)/400*animationBaseTime;
        this.$('.blackout-tabs-slider-scroller').animate({
          scrollLeft: scrollMax+'px',
        },scrollTime,()=>{
          cancelAnimationFrame(globalID);
        });
        globalID = requestAnimationFrame(repeatOften);
      });
      this.$('.blackout-tabs-slider-button.left').on('mousedown',()=>{
        let scrollLeft = this.$('.blackout-tabs-slider-scroller')[0].scrollLeft;
        let scrollTime = scrollLeft/400*animationBaseTime;
        this.$('.blackout-tabs-slider-scroller').animate({
          scrollLeft: '0px',
        },scrollTime,()=>{
          cancelAnimationFrame(globalID);
        });
        globalID = requestAnimationFrame(repeatOften);
      });
      
      // React to button release
      this.$('.blackout-tabs-slider-button').on('mouseup',()=>{
        stopAnimating();
      });
      
    }
    
  },
  
  canScrollLeft(buffer=10){
    
    let scrollLeft = this.$('.blackout-tabs-slider-scroller')[0].scrollLeft;
    return scrollLeft>0+buffer;
    
  },
  
  canScrollRight(buffer=10){
    
    let scrollLeft = this.$('.blackout-tabs-slider-scroller')[0].scrollLeft;
    let scrollMax = this.$('.blackout-tabs-slider')[0].scrollWidth - this.$('.blackout-tabs-slider-scroller').width();
    return scrollLeft<scrollMax-buffer;
    
  },
  
});
