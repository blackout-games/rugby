import Ember from 'ember';

export default Ember.Component.extend({
  
  defaultHeight: 150,
  content: [],
  contentProxy: [],
  
  /**
   * Multiples of scroller height
   * @type {Number}
   */
  bufferSize: 1,
  
  /**
   * This should be set to true from the consumer before initialisation if data needs to be loaded, this will keep infinite scroll from just showing nothing.
   * @type {Boolean}
   */
  doesLoadData: false,
  
  useContentProxy: false,
  
  onInit: Ember.on('init',function(){
    
    let vcTagName = this.get('verticalCollectionTag');
    
    // Create a fresh css pseudo rule
    Ember.Blackout.addCSSRule( vcTagName + ' .vertical-item', 'min-height: '+this.get('defaultHeight')+'px;');
    
    this.set('contentProxy',null);
  }),
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    
    /**
     * contentProxy fixes smoke and mirrors vertical-collection when it's rendered
     * while under display: none.
     * We wait till next run-loop before passing on content, when it's ready to go
     */
    if(this.attrChanged(attrs,'content') && this.get('content')){
      
      /**
       * We need two run loops
       * Test by loading a player, go to history.
       * Switch to another player. Go to info tab.
       * Switch back to original player where history is already loaded.
       * Go to history tab. History should load fine.
       */
      if(this.get('doesLoadData')){
        Ember.run.next(()=>{
          Ember.run.next(()=>{
            this.set('contentProxy',this.get('content'));
          });
        });
      } else {
        this.set('contentProxy',this.get('content'));
      }
    }
    
  }),
  
  scrollerSelectorProp: Ember.computed('scrollerSelector',function(){
    if(this.get('scrollerSelector')){
      return this.get('scrollerSelector');
    } else {
      return '#nav-body';
    }
  }),
  
  verticalCollectionTag: Ember.computed(function(){
    return 'vertical-collection-' + Ember.Blackout.generateId().toLowerCase();
  }),
  
});
