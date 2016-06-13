import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  
  classNames: ['clearfix'],
  showMe: false,
  defaultSize: 150,
  attributeBindings: ['id'],
  isHorizontal: false,
  
  /**
   * Multiples of viewport
   * @type {Number}
   */
  bufferSize: 1,
  
  viewportOptionsOverride: Ember.on('didInsertElement', function() {
    
    let $viewport = Ember.$(window);
    let topAndBottom = this.get('isHorizontal') ? 10000 : this.get('bufferSize') * $viewport.innerHeight();
    let leftAndRight = this.get('isHorizontal') ? this.get('bufferSize') * $viewport.innerWidth() : 10000;
    
    Ember.setProperties(this, {
      viewportUseRAF            : true,
      viewportSpy               : window.os.touchOS,
      //viewportSpy               : true,
      viewportScrollSensitivity : 10,
      viewportRefreshRate       : 100,
      viewportTolerance: {
        top    : topAndBottom,
        bottom : topAndBottom,
        left   : leftAndRight,
        right  : leftAndRight,
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
    
    /**
     * A wait is needed for some cases, e.g. season fixtures. Otherwise it 'enters' on all items, then exits on some meaning it takes just as long.
     */
    Ember.run.next(()=>{
      //print('entered');
      this.set('showMe',true);
      this.updateMe();
      
      // Save real size
      Ember.run.next(()=>{
        let size = this.get('isHorizontal') ? this.$().outerWidth(true) : this.$().outerHeight(true);
        this.set('defaultSize',size);
      });
    });
    
  },

  didExitViewport() {
    //print('exited');
    this.set('showMe',false);
    this.updateMe();
  },
  
  updateMe(){
    if(this.get('showMe')){
      this.$().css({
        width: '',
        height: '',
        margin: '',
        background: '',
      });
    } else {
      if(this.get('isHorizontal')){
        this.$().css({
          width: this.get('defaultSize') + 'px',
          margin: 0,
        });
      } else {
        this.$().css({
          width: '100%',
          //background: 'tomato',
          height: this.get('defaultSize') + 'px',
          margin: 0,
        });
      }
      
    }
  },
  
});
