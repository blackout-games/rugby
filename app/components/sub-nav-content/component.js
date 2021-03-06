import Ember from 'ember';

export default Ember.Component.extend({
  locals: Ember.inject.service(),
  
  /**
   * Set this to prevent sub-nav recreation when same sub-nav is used in multiple routes
   * @type {String}
   */
  name: null,
  
  /**
   * Set this to keep sub routes when sub-nav menu-links are clicked
   * @type {Boolean}
   */
  keepSubRoutes: false,
  
  createSubNav: Ember.on('didInsertElement',function(){
    
    let currentName = this.get('locals').read('subNavCurrentName');
    let queueDestroy = this.get('locals').read('subNavQueueDestroy');
    
    if(queueDestroy){
      this.get('locals').write('subNavQueueDestroy',false);
      if(currentName !== this.get('name')){
        // Destroy now
        this.get('eventBus').publish('destroySubNav',this.$());
      }
    }
    
    this.get('locals').write('subNavCurrentName',this.get('name'));
    this.get('eventBus').publish('createSubNav',this.$(),Ember.Blackout.processAttrs(this.attrs));
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    this.get('locals').write('subNavQueueDestroy',true);
    
    Ember.run.scheduleOnce('afterRender', this, this.doDestroy);
  }),
  
  doDestroy(){
    let queueDestroy = this.get('locals').read('subNavQueueDestroy');
    if(queueDestroy){
      this.get('eventBus').publish('destroySubNav',this.$());
    }
  },
  
  /**
   * Allows us to update heights etc. when a property changes
   */
  onUpdate: Ember.on('didUpdateAttrs',function(attrs){
    if(this.attrChanged(attrs,'updateOn')){
      Ember.run.scheduleOnce('afterRender', this, ()=>{
        this.get('eventBus').publish('updateSubNav',this.$(),Ember.Blackout.processAttrs(this.attrs));
      });
    }
  }),
  
});
