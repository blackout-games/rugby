import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  tabIds: [],
  
  buildTabs: Ember.on('didInsertElement',function(){
      
    $.each(this.get('tabPanels'),(i,$panel)=>{
      
      if(!this.get('hideTabs')){
        
        // Build tab
        let $tab = $('<a>' + $panel.data('tab-name') + '</a>');
        
        // Handle tab click
        $tab.on('mousedown touchstart',()=>{
          this.send('selectTab',$panel.prop('id'));
        });
        
        // Add tab to DOM
        this.$('.blackout-tabs-container').append($tab);
        this.$('.blackout-tabs-container').append(' ');
      
      }
        
      // Add id to list
      this.get('tabIds').push($panel.prop('id'));
        
    });
    
  }),
  
  detectExternalTabChange: Ember.on('didReceiveAttrs',function(options){
    
    if(this.attrChanged(options,'externalSelectedTab')){
      this.send('selectTab',this.get('externalSelectedTab'),true);
    }
    
  }),
  
  actions: {
    selectTab( tabId, wasExternal ){
      this.set('tabDirection',this.determineDirection(tabId));
      
      this.set('selectedTab',tabId);
      if(!wasExternal){
        this.set('externalSelectedTab',tabId);
      }
      this.set('newlySelectedTab',tabId);
    },
  },
  
  determineDirection( newTab ){
    
    let currentTab = this.get('selectedTab');
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
