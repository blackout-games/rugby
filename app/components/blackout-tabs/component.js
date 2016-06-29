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
   * If true, tabs won't wait until loaded before switching,
   * and instead show a loader while ember renders.
   * This gives a more responsive feel overall I think.
   * @type {Boolean}
   */
  loadTabsImmediatelyWithLoader: true,
  
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
    
    if(this.attrChanged(options,'selectedTab') && this.get('selectedTab') !== this.get('yieldTab')){
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
  
  deregisterTab(id,updateUrl){
    
    // Add id to list
    this.get('tabIds').removeObject(id);
    
    if(this.get('yieldTab') === id){
      this.send('selectTab',this.get('indexTab'),false,false,false,updateUrl);
    }
    
  },
  
  indexTab: Ember.computed('tabIds.[]',function(){
    return this.get('tabIds.firstObject');
  }),
  
  defaultIndexTab: Ember.computed('indexTab',function(){
    if(this.get('defaultTab')){
      return this.get('defaultTab');
    } else {
      return this.get('indexTab');
    }
  }),
  
  selectDefaultTab: Ember.on('didInsertElement',function(){
    
    if( this.get('defaultIndexTab') ){
      
      // Select default
      Ember.run.next(()=>{
        // If a tab hasn't been selected by some other method (e.g. blackout-tab-selector)
        // Must use yieldTab since 'selectedTab' can be overwritten with the default value from the parent component *after* a tab has already been selected via URL (eventbus)
        if(!this.get('yieldTab')){
          this.send('selectTab',this.get('defaultIndexTab'),false,false,true);
        } else {
          // Don't do this or it creates multiple calls to selectTab in one loop (e.g. when loading the player page direct from url)
          // If a default tab is not being selected, ensure an index route exists which uses blackout-tab-selector
          //this.send('selectTab',this.get('selectedTab'));
        }
        
      });
      
    }
    
  }),
  
  defaultTabHasBeenSet: false,
  
  actions: {
    receivePanels( panels ){
      if(this.attrs.receiveTabs){
        this.attrs.receiveTabs(panels);
      }
    },
    registerTab(id/*, name*/){
      this.registerTab(id);
    },
    deregisterTab(id,updateUrl){
      this.deregisterTab(id,updateUrl);
    },
    selectTabFromURL( panelId ){
      if(!this.get('URLSet')){
        let tabId = this.get('tabGroup')+'-'+panelId+'-panel';
        if(tabId !== this.get('yieldTab')){
          // Don't set wasExternal here
          this.send('selectTab',tabId,false,true);
        }
      } else {
        this.set('URLSet',false);
      }
    },
    selectTab( tabId, wasExternal, wasViaURL, forceImmediate=false, forceUpdateUrl=false ){
      
      if(Date.now() - this.get('tabLastSelected') >= 111){
        
        let previousTab = this.get('yieldTab');
        
        if(wasViaURL||forceImmediate){
          this.set('tabDirection','immediate');
        } else {
          this.set('tabDirection',this.determineDirection(tabId));
        }
        
        let changeTab = ()=>{
          this.set('switcherTab',tabId);
          
          if(!this.get('loadTabsImmediatelyWithLoader')){
            // For sending changes out publicly
            // Only call once tab is actually selected
            if(this.attrs.onTabChange){
              this.attrs.onTabChange(tabId);
            }
          }
          
          this.set('tabLastSelected',Date.now());
          
        };
        
        // Set a commicator attr if this is from the URL so the we can skip
        // the small waiting period at the tab component
        this.set('wasViaURL',wasViaURL);
        
        // Set yield first
        // Causes child tab element to 'yield' the DOM elements for rendering
        this.set('yieldTab',tabId);
        
        // For sending changes out of this component, but still internally within tab components
        // MUST happen after we set yieldTab to prevent this action from going up and back down and running this function again
        if(!wasExternal){
          
          if(this.attrs.selectTab){
            this.attrs.selectTab(tabId);
          }
          
        }
        
        // Get already waiting group
        let tabGroupWaiting = this.get('cache.tabGroupWaiting');
        
        if(tabGroupWaiting && !this.get('loadTabsImmediatelyWithLoader')){
          
          // If there is already a group waiting, it's most likely a parent of this group, so we don't need to wait
          changeTab();
          
        } else {
          
          this.set('cache.tabGroupWaiting',this.get('tabGroup'));
          
          // We wait to ensure any sub tab groups can get setup. Otherwise we see them flash and flicker and render once this tab is loaded.
          Ember.run.next(()=>{
            this.set('cache.tabGroupWaiting',false);
            changeTab();
          });
          
        }
        
        // At this point wasExternal should really mean, wasManualClick
        // TODO: If tabs are ever used without an external tab control (e.g. tabs-slider) wasManual should actually represent when the user has manually selected a tab.
        // For now, since we only use external controls (e.g. tabs-slider) to handle user clicks, this works fine.
        let wasManual = wasExternal;
        //log('tab1',tabId);
        // Set route (later so that it doesn't slow down animation)
        if(this.get('tabRoute') && ((!wasViaURL && wasManual) || forceUpdateUrl)){
          Ember.run.later(()=>{
            
            let route = Ember.Blackout.getCurrentRoute();
            let parts = route.split('.');
            let newRoute = this.get('previousRoutes.'+tabId);
            let success = true;
            //log('tab3','newRoute',newRoute);
            
            // Save route of current tab first
            this.set('previousRoutes.'+previousTab,route);
            
            if(Ember.isEmpty(newRoute)){
              //log('tab4',tabId);
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
                    }
                    
                    return false;
                    
                  }
                });
                
                newRoute = newRoute.rtrim('.');
                //log('tab5',newRoute);
              }
              
            }
            
            if(success && newRoute!==route){
              this.set('URLSet',true);
              Ember.Blackout.transitionTo(newRoute);
            }
            
          },50);
          
        } else {
          
          if(this.get('defaultTab') && !this.get('defaultTabHasBeenSet')){
            
            this.set('URLSet',true);
            let newRoute = tabId.replace(new RegExp(this.get('tabGroup')+'-|-panel', 'g'),'');
            let indexRoute = this.get('indexTab').replace(new RegExp(this.get('tabGroup')+'-|-panel', 'g'),'');
            let currentRoute = Ember.Blackout.getCurrentRoute();
            let fullRoute = currentRoute;
            if(indexRoute!==newRoute){
              fullRoute = currentRoute.replace('.index','.'+newRoute);
            }
            Ember.Blackout.transitionTo(fullRoute);
            
            this.set('defaultTabHasBeenSet',true);
            
          }
          
        }
        
      }
    },
  },
  
  determineDirection( newTab ){
    
    let currentTab = this.get('yieldTab');
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
