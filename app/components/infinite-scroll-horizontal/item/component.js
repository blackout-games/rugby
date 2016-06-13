import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  
  classNames: [],
  showMe: false,
  defaultWidth: 150,
  attributeBindings: ['id'],
  
  /**
   * Multiples of viewport
   * @type {Number}
   */
  bufferSize: 1,
  
  viewportOptionsOverride: Ember.on('didInsertElement', function() {
    let $viewport = Ember.$(window);
    Ember.setProperties(this, {
      viewportUseRAF            : true,
      viewportSpy               : window.os.touchOS,
      viewportScrollSensitivity : 10,
      viewportRefreshRate       : 100,
      viewportTolerance: {
        top    : 0,
        bottom : 0,
        left   : this.get('bufferSize') * $viewport.innerWidth(),
        right  : this.get('bufferSize') * $viewport.innerWidth(),
      }
    });
    
    this.updateMe();
  }),
  
  id: Ember.computed('itemId','item',function(){
    let itemId = this.get('itemId');
    if(itemId){
      itemId = itemId.replace(/{{([\w]+)}}/,(fullmatch,key)=>{
        return this.get(`item.${key}`);
      });
      return itemId;
    } else {
      return null;
    }
  }),
  
  didEnterViewport() {
    //console.log('entered');
    this.set('showMe',true);
    this.updateMe();
    
    // Save real width
    let width = this.$().outerWidth(true);
    this.set('defaultWidth',width);
  },

  didExitViewport() {
    //console.log('exited');
    this.set('showMe',false);
    this.updateMe();
  },
  
  updateMe(){
    if(this.get('showMe')){
      this.$().css({
        width: '',
      });
    } else {
      this.$().css({
        width: this.get('defaultWidth') + 'px',
      });
    }
  },
  
});
