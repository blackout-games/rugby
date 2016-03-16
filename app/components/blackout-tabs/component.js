import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  tabIds: [],
  tabLastSelected: 0,
  routeLastUpdated: 0,
  previousRoutes: Ember.Object.create(),
  
  /**
   * Use this to set new tabs externally
   */
  selectedTab: '',
  
  /**
   * Use this to externally react to newly selected tabs
   */
  onTabChange: null, // Action
  
  /**
   * This should uniquely identify the tab group in a global namespace
   */
  tabGroup: '',
  
  /**
   * This should match the parent route name used (if using actual ember routes to set tabs with blackout-tab-selector)
   * 
   * Will be set to the same as tabGroup if not explicitly set.
   */
  tabRoute: '',
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('tabGroup')){
      this.get('eventBus').subscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.actions.selectTabFromURL);
      this.get('eventBus').subscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.iamcool);
      
      if(!this.get('tabRoute')){
        this.set('tabRoute',this.get('tabGroup'));
      }
    }
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    if(this.get('tabGroup')){
      this.get('eventBus').unsubscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.actions.selectTabFromURL);
    }
  }),
  
  buildTabs: Ember.on('didInsertElement',function(){
    
    let defaultId;
    
    $.each(this.get('tabPanels'),(i,$panel)=>{
      
      let id = $panel.prop('id');
      
      if(!this.get('hideTabs')){
        
        // Build tab
        let $tab = $('<a>' + $panel.data('tab-name') + '</a>');
        
        // Handle tab click
        $tab.on('mousedown touchstart',()=>{
          this.send('selectTab',id);
        });
        
        // Add tab to DOM
        this.$('.blackout-tabs-container').append($tab);
        this.$('.blackout-tabs-container').append(' ');
      
      }
        
      // Add id to list
      this.get('tabIds').push(id);
      
      if(!defaultId){
        defaultId = id;
      }
      
      // Save first tab id (index)
      if(!this.get('indexTab')){
        this.set('indexTab',id);
      }
        
    });
    
    // Select default
    Ember.run.next(()=>{
      
      // If a tab hasn't been selected by some other method (e.g. blackout-tab-selector)
      // Must use switcherTab since 'selectedTab' can be overwritten with the default value from the parent component *after* a tab has already been selected via URL (eventbus)
      if(!this.get('switcherTab')){
        this.send('selectTab',defaultId);
      } else {
        // Don't do this or it creates multiple calls to selectTab in one loop (e.g. when loading the player page direct from url)
        // If a default tab is not being selected, ensure an index route exists which uses blackout-tab-selector
        //this.send('selectTab',this.get('selectedTab'));
      }
      
    });
    
  }),
  
  detectExternalTabChange: Ember.on('didReceiveAttrs',function(options){
    
    if(this.attrChanged(options,'selectedTab')){
      this.send('selectTab',this.get('selectedTab'),true);
    }
    
  }),
  
  actions: {
    selectTabFromURL( panelId ){
      if(!this.get('URLSet')){
        // Don't set wasExternal here
        this.send('selectTab',this.get('tabGroup')+'-'+panelId+'Panel',false,true);
      } else {
        this.set('URLSet',false);
      }
    },
    selectTab( tabId, wasExternal, wasViaURL ){
      
      if(Date.now() - this.get('tabLastSelected') >= 111){
        
        let previousTab = this.get('switcherTab');
        
        if(wasViaURL){
          this.set('tabDirection','immediate');
        } else {
          this.set('tabDirection',this.determineDirection(tabId));
        }
        
        this.set('switcherTab',tabId);
        
        // For sending changes out
        if(!wasExternal){
          
          if(this.attrs.onTabChange){
            this.attrs.onTabChange(tabId);
          }
          
        }
        
        // At this point wasExternal should really mean, wasManualClick
        // TODO: If tabs are ever used without an external tab control (e.g. tabs-slider) wasManual should actually represent when the user has manually selected a tab.
        // For now, since we only use external controls (e.g. tabs-slider) to handle user clicks, this works fine.
        let wasManual = wasExternal;
        
        // Set route (later so that it doesn't slow down animation)
        if(this.get('tabRoute') && !wasViaURL && wasManual){
          Ember.run.later(()=>{
            
            
            let route = Ember.Blackout.getCurrentRoute();
            let parts = route.split('.');
            let newRoute = this.get('previousRoutes.'+tabId);
            
            // Save route of current tab first
            this.set('previousRoutes.'+previousTab,route);
            
            if(Ember.isEmpty(newRoute)){
              
              newRoute = '';
              
              $.each(parts,(i,val)=>{
                newRoute += val + '.';
                
                if(val === this.get('tabRoute')){
                  
                  if(this.get('indexTab') !== tabId){
                    newRoute += tabId.replace(/.+-|Panel/g,'');
                  } else {
                    newRoute = newRoute.rtrim('.');
                  }
                  
                  return false;
                  
                }
              });
              
            }
              
            if(newRoute!==route){
              this.set('URLSet',true);
              Ember.Blackout.transitionTo(newRoute);
            }
            
          },50);
          
        }
        
        this.set('tabLastSelected',Date.now());
        
      }
    },
  },
  
  determineDirection( newTab ){
    
    let currentTab = this.get('switcherTab');
    let direction = 'left';
    
    $.each(this.get('tabIds'),(i,tabId)=>{
      if(tabId===newTab){
        direction = 'right';
        return false;
      } else if(tabId===currentTab){
        direction = 'left';
        return false;
      }
    });
    
    return direction;
    
  },
  
});
