import Ember from 'ember';

export default Ember.Component.extend({
  
  /**
   * If these tabs are under another set of tabs, or otherwise in a position where they may not be rendered on screen at all times, you should pass in a variable isShowing to let this component know when the tabs are visible.
   * This allows tab sliders to update tab width based on the width of the slider parent to ensure the last tab is half visible to let the user know they can slide to see more tabs.
   * @type {Boolean}
   */
  isShowing:false,
  
  actions: {
    tabChanged( tabId ){
      if( this.attrs.onTabChange ){
        this.attrs.onTabChange( tabId );
      }
    },
  }
  
});
