import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  locale: Ember.inject.service(),
  
  classNames: [],
  preSelectTabId: '',
  tabs: Ember.Object.create(),
  
  /**
   * Use this to externally react to newly selected tabs
   */
  onTabSelect: null, // Action
  
  /**
   * Not sure why we need to do this.
   * Ember should be creating a fresh instance of this component every time. But sometimes it seems to reuse old versions, with stale data
   * 
   * IR definitely still ember noob.
   */
  resetVars: Ember.on('init',function(){
    this.set('tabs',Ember.Object.create());
  }),
  
  reactToAttrs: Ember.on('didReceiveAttrs',function(options){
    
    if(this.attrChanged(options,'selectedTab')){
      
      let id = this.get('selectedTab');
      let $tab = this.get('tabs.'+id);
      
      if($tab && $tab.length){
        this.selectTab(id,$tab);
      } else {
        this.set('preSelectTabId',id);
      }
    }
    
    if(this.attrChanged(options,'tabPanels')){
      this.buildTabs();
    }
    
    if(this.attrChanged(options,'isOnScreen')){
      if(this.get('isOnScreen')){
        Ember.run.debounce(this,this.updateTabWidth,1);
        Ember.run.debounce(this,this.preScrollToSelectedTab,1);
      }
    }
    
  }),
  
  selectTab(id,$tab,wasManual){
    if(wasManual){
      if(this.attrs.onTabSelect){
        this.attrs.onTabSelect(id);
      }
    }
    this.$('.blackout-tabs-slider-tab').removeClass('active');
    $tab.addClass('active');
  },
  
  buildTabs(){
    
    // Clear out any old tabs
    this.$('.blackout-tabs-slider').html('');
    
    let $defaultTab;
    
    // Build new ones
    $.each(this.get('tabPanels'),(i,$panel)=>{
      
      let $tab,label;
      
      // Label
      if($panel.data('tab-t')){
        label = this.get('locale').htmlT($panel.data('tab-t'));
      } else {
        label = $panel.data('tab-name');
      }
      
      // Build tab
      if($panel.data('tab-icon-class')){
        $tab = $('<a class="vc-parent blackout-tabs-slider-tab col-fixed no-webkit-highlight no-hover"><div class="vc-child"><div class="text-center tab-icon"><i class="' + $panel.data('tab-icon-class') + ' blackout-tabs-icon icon-vcenter"></i></div><div class="text-center ellipses">' + label + '</div></div></a>');
      } else {
        $tab = $('<a>' + label + '</a>');
      }
      
      // Handle tab click
      //$tab.on('mousedown touchstart',()=>{
      $tab.on('mousedown',()=>{
        this.selectTab($panel.prop('id'),$tab,true);
      });
      
      // Handle touch devices
      let canClick = false;
      $tab.on('touchstart',()=>{
        Ember.run.later(()=>{
          if(canClick){
            this.selectTab($panel.prop('id'),$tab,true);
          }
        },77);
        canClick = true;
      });
      $tab.on('touchmove',()=>{
        canClick = false;
      });
      
      // Mark tab with panel id
      this.set('tabs.'+$panel.prop('id'),$tab);
      
      // Add tab to DOM
      this.$('.blackout-tabs-slider').append($tab);
      this.$('.blackout-tabs-slider').append(' ');
      
      if(this.get('preSelectTabId') === $panel.prop('id')){
        $defaultTab = $tab;
      }
      
    });
    
    if(this.get('preSelectTabId') && $defaultTab){
      // Build tabs is called as a result of external change
      this.selectTab(this.get('preSelectTabId'),$defaultTab);
      this.set('preSelectTabId','');
    }
    
    // Add end
    this.$('.blackout-tabs-slider').append($('<div class="col-fixed blackout-tabs-slider-end"></div>'));
    
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
        this.$('.blackout-tabs-slider-scroller').stop().animate({
          scrollLeft: scrollMax+'px',
        },scrollTime,()=>{
          cancelAnimationFrame(globalID);
        });
        globalID = requestAnimationFrame(repeatOften);
      });
      this.$('.blackout-tabs-slider-button.left').on('mousedown',()=>{
        let scrollLeft = this.$('.blackout-tabs-slider-scroller')[0].scrollLeft;
        let scrollTime = scrollLeft/400*animationBaseTime;
        this.$('.blackout-tabs-slider-scroller').stop().animate({
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
    
    // If tabs are scrollable, animate a scroll at the start to show user they are scollable
    Ember.run.later(()=>{
      if(this.get('isOnScreen')){
        Ember.run.debounce(this,this.updateTabWidth,1);
        Ember.run.debounce(this,this.preScrollToSelectedTab,1);
      }
    },50);
    
    //this.updateTabWidthBound = Ember.run.bind(this,this.updateTabWidth);
    //$(window).on('resize',this.updateTabWidthBound);
    
  },
  
  updateTabWidth(){
    
    // Get width of scroller
    let scrollerWidth = this.$().findClosest('.blackout-tabs-slider-scroller').width();
    
    // Current tab width
    let tabWidth;
    if(!this.get('tabWidth')){
      tabWidth = this.$().findClosest('.blackout-tabs-slider-tab').first().width();
      this.set('tabWidth',tabWidth);
    } else {
      tabWidth = this.get('tabWidth');
    }
    
    let totalTabsWidth = tabWidth * this.get('tabPanels').length;
    
    if(totalTabsWidth > scrollerWidth + tabWidth*0.77){
      
      // Find best width for tabs
      let newWidth = Math.round(scrollerWidth / (Math.floor(scrollerWidth/tabWidth) + 0.5)) - 1;
      
      if(newWidth<70){
        newWidth = Math.round(scrollerWidth / (Math.floor(scrollerWidth/tabWidth) - 0.5)) - 1;
      }
      
      // Set width for tabs
      this.$('.blackout-tabs-slider-tab').width(newWidth);
      
      this.$().findClosest('.blackout-tabs-slider-end').show();
      
    } else if(totalTabsWidth > scrollerWidth){
      
      // Tabs are only just longer than scroller so just shorten tabs
      let newWidth = Math.round(scrollerWidth / this.get('tabPanels').length) - 3;
      
      // Set width for tabs
      this.$('.blackout-tabs-slider-tab').width(newWidth);
      
    }
      
  },
  
  
  preScrollToSelectedTab(){
    
    if(this.canScrollRight()){
      
      // Calulate scroll distance
      let scrollerWidth = this.$().findClosest('.blackout-tabs-slider-scroller').width();
      let scrollMax = this.$('.blackout-tabs-slider')[0].scrollWidth - this.$('.blackout-tabs-slider-scroller').width();
      let activeTab = this.$('.blackout-tabs-slider-tab.active');
      let tabWidth = activeTab.width();
      let tabIndex = activeTab.index();
      let left = tabIndex*tabWidth;
      let leftWhenInMiddle = scrollerWidth*0.5-tabWidth*0.5;
      let requiredScroll = left-leftWhenInMiddle;
      let limitedScroll = Math.min(requiredScroll,scrollMax);
      
      if(!this.get('hasAnimatedPreScroll')&&false){
        
        // Animate
        this.$('.blackout-tabs-slider-scroller').stop().animate({
          scrollLeft: limitedScroll,
        },1111,'easeOutExpo');
        
        this.set('hasAnimatedPreScroll',true);
        
      } else {
        
        this.$('.blackout-tabs-slider-scroller')[0].scrollLeft = limitedScroll;
        
      }
      
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
