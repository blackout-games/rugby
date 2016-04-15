import Ember from 'ember';

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
  /**
   * If these tabs are under another set of tabs, or otherwise in a position where they may not be rendered on screen at all times, you should pass in a variable isOnScreen to let this component know when the tabs are visible.
   * This allows tab sliders to update tab width based on the width of the slider parent to ensure the last tab is half visible to let the user know they can slide to see more tabs.
   * If not set explicitly, assume we're onscreen so that changes can be seen.
   * @type {Boolean}
   */
  isOnScreen:true,
  
  classNames: ['dash-box','dash-box-no-padding'],
  
  setupTabs(){
    
    if(!this.get('noPadding')){
      
      if(this.get('noSidePadding')){
        
        Ember.$.each(this.get('dashTabs'),(i,$tab)=>{
          if(!$tab.data('tab-no-padding')){
            $tab.addClass('dash-box-no-side-padding');
          }
        });
        
      } else if(this.get('noSidePaddingMobile')){
        
        Ember.$.each(this.get('dashTabs'),(i,$tab)=>{
          if(!$tab.data('tab-no-padding')){
            $tab.addClass('dash-box-no-side-padding-mobile');
          }
        });
        
      }
      
      if(this.get('noPaddingMobile')){
        
        Ember.$.each(this.get('dashTabs'),(i,$tab)=>{
          if(!$tab.data('tab-no-padding')){
            $tab.addClass('dash-box-no-padding-mobile');
          }
        });
        
      } else {
        
        Ember.$.each(this.get('dashTabs'),(i,$tab)=>{
          if(!$tab.data('tab-no-padding')){
            $tab.addClass('dash-box-padding');
          }
        });
        
      }
      
    }
    
    // Sub-tabs mode
    if(this.get('sub')){
      this.$().addClass('sub-tabs');
    } else {
      
      this.$().css({
        'border-top-left-radius': '9px',
        'border-top-right-radius': '9px',
      });
    
    }
    
    // Can cause issues when tab contains lots of stuff
    // It broke the squad page when applied to all dash-boxes by default
    // May break select dropdowns. Not sure yet.
    this.$().addClass('no-overflow');
    
  },
  
  /**
   * For sending data down
   */
  actions: {
    
    receiveTabRegistration(registerTab,deregisterTab){
      this.set('registerTab',registerTab);
      this.set('deregisterTab',deregisterTab);
    },
    
    registerTab(id/*, name*/){
      this.get('registerTab')(id);
    },
    deregisterTab(id){
      this.get('deregisterTab')(id);
    },
    
    receiveTabs( tabs ){
      this.set('dashTabs',tabs);
      this.setupTabs();
    },
    
    selectTab( newTab ){
      this.tabChanged(newTab);
      /**
       * Avoid ember telling us we have modified a value twice in a single render
       */
      Ember.run.once(this,this.setTabs,newTab);
    },
    
  },
  
  setTabs(newTab){
    this.set('selectedTab',newTab);
  },
  
  /**
   * For sending an action up
   */
  tabChanged(tab){
    if(this.attrs.onTabChange){
      this.attrs.onTabChange(tab);
    }
  },
  
});
