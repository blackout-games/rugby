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
  
  actions: {
    tabChanged( tabId ){
      if( this.attrs.onTabChange ){
        this.attrs.onTabChange( tabId );
      }
    },
  }
  
});
