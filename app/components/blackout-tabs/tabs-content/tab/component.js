import Ember from 'ember';

export default Ember.Component.extend({
  
  isShowing: false,
  isLoadingTab: true,
  isLoadingData: false, // Can be set on tabs consumer
  
  actions: {
    
    /**
     * This allows us to let the actual tab content, whatever that may be
     * to call these actions and cause the loader to show for longer
     */
    registerTabLoading(){
      this.set('isLoadingTabContent',true);
    },
    finishTabLoading(){
      this.set('isLoadingTabContent',false);
      this.finishLoading();
    },
    
  },
  
  // The following commented sections allow preloading of tabs after the initial tab is loaded. However, this results in lagginess when the user may be acting. Plus we don't know if the user will actually ever go to these tabs, so we only load them when needed.
  //hasInsert: false,
  //timeToWait: 2222, // Allow enough time for animations, and enough time so that if user clicks a whole different route quickly, we won't have even bothered setting up other tabs
  
  preSetup: Ember.on('didReceiveAttrs',function(attrs){
    
    if(this.attrChanged(attrs,'resetOn')){
      this.cancelRunLater();
      if(this.get('currentlyShowing') !== this.get('id')){
        this.set('isShowing',false);
      }
      
      /*if(this.get('hasInsert')){
        let runLater = Ember.run.later(()=>{
          this.cancelRunLater();
          this.set('isShowing',true);
        },this.get('timeToWait'));
        this.set('runLater',runLater);
      }*/
    }
    
    if(this.attrChanged(attrs,'currentlyShowing') && this.get('currentlyShowing')){
      
      if(this.get('currentlyShowing') === this.get('id')){

        if(!this.get('isShowing')){  
          
          
          // Prevent parent tab from showing until we're done
          if(this.get('isSubTabs') && this.get('parentTab')){
            this.get('parentTab').registerTabLoading();
          }
          
                  
          if(this.get('loadTabsImmediatelyWithLoader')){
            if(!this.get('dontWait')){
              this.set('isLoadingTab',true);
              
              if(this.get('isSubTabs')||this.get('wasViaURL')){
                
                this.set('isShowing',true);
                Ember.run.next(()=>{
                  if(this.get('wasViaURL')){
                    /**
                     * Waiting twice allows for subtabs to prevent parentTab from showing too fast.
                     */
                    Ember.run.next(()=>{
                      this.finishLoading();
                    });
                  } else {
                    this.finishLoading();
                  }
                });
                
              } else {
                
                // Wait a little extra for tabs which have heavy ember content, otherwise ember just jumps straight into loading the tab without displaying the loader. Then loader flashes only for an instance. e.g. player history
                Ember.run.later(()=>{
                  this.set('isShowing',true);
                  Ember.run.next(()=>{
                    /**
                     * Waiting twice allows for subtabs to prevent parentTab from showing too fast.
                     */
                    Ember.run.next(()=>{
                      this.finishLoading();
                    });
                  });
                },77); // search: render-wait-time
              }
            } else {
              this.set('isShowing',true);
              this.finishLoading();
            }
          } else {
            this.set('isShowing',true);
          }
          
        } else {
          
          // Already rendered DOM
          this.tabIsSelected();
          
        }
      }
      
    }
    
  }),
  
  finishLoading(){
    if(!this.get('isLoadingTabContent')){
      this.set('isLoadingTab',false);
      this.tabIsSelected();
      
      if(this.get('isSubTabs') && this.get('parentTab')){
        this.get('parentTab').finishTabLoading();
      }
    }
  },
  
  tabIsSelected(){
    // For sending changes out publicly
    // Only call once tab is actually selected
    // (And onluf if loadTabsImmediatelyWithLoader is true)
    if(this.attrs.onTabChange){
      this.attrs.onTabChange(this.get('id'));
    }
  },
  
  cancelRunLater(){
    let runLater = this.get('runLater');
    if(runLater){
      Ember.run.cancel(runLater);
      if(!this.get('isDestroyed')){
        this.set('runLater',false);
      }
    }
  },
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('noPadding')){
      this.$().data('tab-no-padding',true);
    }
    
    if(this.get('sidePaddingOnly')){
      this.$().data('tab-side-padding-only',true);
    }
    
    /*if(!this.get('isShowing')){
      this.cancelRunLater();
      let runLater = Ember.run.later(()=>{
        this.cancelRunLater();
        this.set('isShowing',true);
      },this.get('timeToWait'));
      this.set('runLater',runLater);
    }
    
    this.set('hasInsert',true);*/
    
  }),
  
});
