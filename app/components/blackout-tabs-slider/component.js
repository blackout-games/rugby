import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  locale: Ember.inject.service(),
  
  classNames: [],
  tabIds: [],
  preSelectTabId: '',
  tabs: Ember.Object.create(),
  
  /**
   * Assume is on screen by default
   * @type {Boolean}
   */
  isOnScreen: true,
  
  /**
   * Use this to manage the current selected tab internally
   */
  currentTab: null,
  
  /**
   * Use this to receive changed tab selection
   */
  selectedTab: null,
  
  /**
   * Use this to send out an action about a newly selected tab
   */
  onTabSelect: null, // Action
  
  /**
   * Force buttons to stay visible while debugging
   * @type {Boolean}
   */
  testButtons: false,
  
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
    
    if(this.attrChanged(options,'selectedTab') && this.get('selectedTab') !== this.get('currentTab')){
      
      let id = this.get('selectedTab');
      let $tab = this.get('tabs.'+id);
      if($tab && $tab.length){
        this.send('selectTab',id);
      } else {
        this.set('preSelectTabId',id);
      }
    }
    
    if(this.attrChanged(options,'isOnScreen')){
      if(this.get('isOnScreen')){
        // Attempt to run now if switching to a tab which holds this sub-tab group
        // This avoids visible 'jumping' after showing this slider.
        this.updateTabWidth();
        // Also run later, for when we open the page straight onto this tab
        Ember.run.debounce(this,this.updateTabWidth,1);
        Ember.run.debounce(this,this.scrollToSelectedTab,1);
      }
    }
    
  }),
  
  actions: {
    selectTab(id,wasManual){
      this.set('currentTab',id);
      if(wasManual){
        if(this.attrs.selectTab){
          this.attrs.selectTab(id);
        }
      } else {
        
        // If was an auto select, scroll to tab
        if(this.get('isOnScreen')){
          Ember.run.next(()=>{
            this.updateTabWidth();
            this.scrollToSelectedTab();
          });
        }
        
        
      }
    }
  },
  
  buildTabs: Ember.on('didInsertElement',function(){
    
    let $defaultTab;
    
    let numTabs = 0;
    
    // Get and save tabs
    this.$('.blackout-tabs-slider-tab').each((i,tab)=>{
      
      let $tab = Ember.$(tab);
      let tabId = $tab.data('tab-id');
      
      // Mark tab with panel id
      this.set('tabs.'+tabId,$tab);
      this.get('tabIds').pushObject('tabs.'+tabId);
      
      if(this.get('preSelectTabId') === tabId){
        $defaultTab = $tab;
      }
      
      numTabs++;
      
    });
    
    this.set('numTabs',numTabs);
    
    if(this.get('preSelectTabId') && $defaultTab){
      // Build tabs is called as a result of external change
      this.send('selectTab',this.get('preSelectTabId'));
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
        } else if(!this.get('testButtons')) {
          this.$('.blackout-tabs-slider-button.left').stop().fadeOut(222);
        }
        if(this.canScrollRight()){
          this.$('.blackout-tabs-slider-button.right').stop().fadeIn(222);
        } else if(!this.get('testButtons')) {
          this.$('.blackout-tabs-slider-button.right').stop().fadeOut(222);
        }
      };
      
      let stopAnimating = ()=>{
        cancelAnimationFrame(globalID);
        this.$('.blackout-tabs-slider-scroller').stop();
      };
      
      // Hide buttons on mouseout
      this.$('.blackout-tabs-slider-hider').on('mouseleave',(e)=>{
        if( !$(e.relatedTarget).hasClass('blackout-tabs-slider-button') && !$(e.relatedTarget).hasParent('.blackout-tabs-slider-button') && !this.get('testButtons') ){
          this.$('.blackout-tabs-slider-button').stop().fadeOut(222);
          stopAnimating();
        }
      });
      
      // Hide buttons on mouse wheel
      this.$('.blackout-tabs-slider-scroller').on('mousewheel',()=>{
        if(!this.get('testButtons')){
          this.$('.blackout-tabs-slider-button').stop().fadeOut(222);
          stopAnimating();
        }
      });
      
      // Hide buttons on mouseout from buttons
      this.$('.blackout-tabs-slider-button').on('mouseleave',(e)=>{
        if( !$(e.relatedTarget).hasClass('blackout-tabs-slider-hider') && !$(e.relatedTarget).hasParent('.blackout-tabs-slider-hider') && !this.get('testButtons') ){
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
        Ember.run.debounce(this,this.scrollToSelectedTab,1);
      }
    },50);
    
    //this.updateTabWidthBound = Ember.run.bind(this,this.updateTabWidth);
    //$(window).on('resize',this.updateTabWidthBound);
    
    if(!this.get('testButtons')){
      this.$('.blackout-tabs-slider-button.left').hide();
      this.$('.blackout-tabs-slider-button.right').hide();
    }
    
  }),
  
  unbuildTabs: Ember.on('willDestroyElement',function(){
    
    this.get('tabIds').forEach((id)=>{
      this.set(id,null);
    });
    
  }),
  
  updateTabWidth(){
    
    if(!this.$()){
      return;
    }
    
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
    
    let totalTabsWidth = tabWidth * this.get('numTabs');
    
    if(scrollerWidth && totalTabsWidth > scrollerWidth + tabWidth*0.77){
      
      // Find best width for tabs
      let newWidth = Math.round(scrollerWidth / (Math.floor(scrollerWidth/tabWidth) + 0.5)) - 1;
      
      if(newWidth<70){
        newWidth = Math.round(scrollerWidth / (Math.floor(scrollerWidth/tabWidth) - 0.5)) - 1;
      }
      
      // Set width for tabs
      this.$('.blackout-tabs-slider-tab').width(newWidth);
      
      this.$().findClosest('.blackout-tabs-slider-end').show();
      
    } else if(scrollerWidth && totalTabsWidth > scrollerWidth){
      
      // Tabs are only just longer than scroller so just shorten tabs
      let newWidth = Math.round(scrollerWidth / this.get('numTabs')) - 3;
      
      // Set width for tabs
      this.$('.blackout-tabs-slider-tab').width(newWidth);
      
    } else {
      this.$('.blackout-tabs-slider-tab').css('width','');
    }
      
  },
  
  
  scrollToSelectedTab(){
    
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
