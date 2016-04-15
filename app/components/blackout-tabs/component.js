import Ember from 'ember';
const { $ } = Ember;

/**
 * Tab naming rules
 * 
 * When giving a tab an id, use the following format
 * 
 * [tabgroup]-[tabname]-panel
 * 
 * e.g.
 * player-manage-panel
 * 
 * Then when creating a route with blackout-tab-selector,
 * use the group and tabname given in the tab id above.
 * 
 */

export default Ember.Component.extend({
  
  tabIds: [], // Creates Ember.Array
  tabLastSelected: 0,
  routeLastUpdated: 0,
  previousRoutes: Ember.Object.create(),
  hasInittedAttrs: false,
  
  /**
   * Use this to set new tabs externally
   */
  selectedTab: null,
  
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
  
  /**
   * Need to reset tabIds on init for when two or more instances of this component are created so there's no bleed-out
   */
  onInit: Ember.on('init',function(){
    this.set('tabIds',[]);
    this.set('hasInittedAttrs',false);
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('tabGroup')){
      this.get('eventBus').subscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.actions.selectTabFromURL);
      this.get('eventBus').subscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.iamcool);
      
      if(!this.get('tabRoute')){
        Ember.run.schedule('afterRender',this,()=>{
          this.set('tabRoute',this.get('tabGroup'));
        });
      }
    }
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    if(this.get('tabGroup')){
      this.get('eventBus').unsubscribe('selectBlackoutTab-'+this.get('tabGroup'),this,this.actions.selectTabFromURL);
    }
  }),
  
  onAttrChange: Ember.on('didReceiveAttrs',function(options){
    
    if(this.attrChanged(options,'selectedTab') && this.get('selectedTab') !== this.get('switcherTab')){
      this.send('selectTab',this.get('selectedTab'),true);
    }
    
    if(!this.get('hasInittedAttrs')){
      
      /**
       * Allow parent component to register tabs
       * For use with tab extensions (e.g. dash-tabs)
       */
      if(this.attrs.tabRegistration){
        this.attrs.tabRegistration(Ember.run.bind(this,this.registerTab),Ember.run.bind(this,this.deregisterTab));
      }
      
      this.set('hasInittedAttrs',true);
    }
    
  }),
  
  registerTab(id){
    
    // Add id to list
    this.get('tabIds').pushObject(id);
    
  },
  
  deregisterTab(id){
    
    // Add id to list
    this.get('tabIds').removeObject(id);
    
    if(this.get('switcherTab') === id){
      this.send('selectTab',this.get('indexTab'));
    }
    
  },
  
  indexTab: Ember.computed('tabIds.[]',function(){
    return this.get('tabIds.firstObject');
  }),
  
  selectDefaultTab: Ember.on('didInsertElement',function(){
    
    if( this.get('indexTab') ){
      
      // Select default
      Ember.run.next(()=>{
        // If a tab hasn't been selected by some other method (e.g. blackout-tab-selector)
        // Must use switcherTab since 'selectedTab' can be overwritten with the default value from the parent component *after* a tab has already been selected via URL (eventbus)
        if(!this.get('switcherTab')){
          this.send('selectTab',this.get('indexTab'),false,false,true);
        } else {
          // Don't do this or it creates multiple calls to selectTab in one loop (e.g. when loading the player page direct from url)
          // If a default tab is not being selected, ensure an index route exists which uses blackout-tab-selector
          //this.send('selectTab',this.get('selectedTab'));
        }
        
      });
      
    }
    
  }),
  
  actions: {
    receivePanels( panels ){
      if(this.attrs.receiveTabs){
        this.attrs.receiveTabs(panels);
      }
    },
    registerTab(id/*, name*/){
      this.registerTab(id);
    },
    deregisterTab(id){
      this.deregisterTab(id);
    },
    selectTabFromURL( panelId ){
      if(!this.get('URLSet')){
        // Don't set wasExternal here
        this.send('selectTab',this.get('tabGroup')+'-'+panelId+'-panel',false,true);
      } else {
        this.set('URLSet',false);
      }
    },
    selectTab( tabId, wasExternal, wasViaURL, forceImmediate=false ){
      
      if(Date.now() - this.get('tabLastSelected') >= 111){
        
        let previousTab = this.get('switcherTab');
        
        if(wasViaURL||forceImmediate){
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
            let success = true;
            
            // Save route of current tab first
            this.set('previousRoutes.'+previousTab,route);
            
            if(Ember.isEmpty(newRoute)){
              
              newRoute = '';
              let tabGroup = this.get('tabGroup');
              
              if(!tabGroup){
                
                Ember.Logger.warn(`Could not update the URL for tab ${tabId} because tabGroup is not specified.`);
                success = false;
                
              } else {
                
                $.each(parts,(i,val)=>{
                  newRoute += val + '.';
                  
                  if(val === this.get('tabRoute')){
                    
                    if(this.get('indexTab') !== tabId){
                      newRoute += tabId.replace(new RegExp(tabGroup+'-|-panel', 'g'),'');
                    } else {
                      newRoute = newRoute.rtrim('.');
                    }
                    
                    return false;
                    
                  }
                });
                
              }
              
            }
            
            if(success && newRoute!==route){
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
