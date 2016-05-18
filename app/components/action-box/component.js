import Ember from 'ember';

/**
 * TODO: Support bottom flows
 */

export default Ember.Component.extend({
  
  /**
   * The position the button should sit in relation to the flow of the menu
   * @type {String}
   */
  flowFrom: 'topLeft',
  
  buttonHeight: 0,
  
  /**
   * The padding to give around the main button
   * @type {Number}
   */
  outerPaddingTop: 5,
  outerPaddingSides: 7,
  
  classNames: ['action-box'],
  classNameBindings: ['topLeft','topRight','bottomLeft','bottomRight'],
  
  /**
   * Internals
   */
  isShowing: false,
  
  topLeft: Ember.computed.equal('flowFrom','topLeft'),
  topRight: Ember.computed.equal('flowFrom','topRight'),
  bottomLeft: Ember.computed.equal('flowFrom','bottomLeft'),
  bottomRight: Ember.computed.equal('flowFrom','bottomRight'),
  
  onInsert: Ember.on('didInsertElement',function(){
    Ember.$('body').on('touchstart mousedown',this,this.handleClose);
  }),
  
  onDestroy: Ember.on('willDestroyElement',function(){
    Ember.$('body').off('touchstart mousedown',this.handleClose);
  }),
    
  handleClose(e){
    let _this = e.data;
    
    if(!_this.get('isShowing')){
      return;
    }
    
    // Left mouse button only
    if(e.type==='mousedown' && e.which!==1){
      return;
    }
    
    let $panels = _this.$('.action-box-button-panel, .action-box-content-panel, .action-box-button');
    
    if(!Ember.$(e.target).hasParent($panels)){
      
      if(Ember.$(e.target)[0]===_this.$('action-box-blocker')[0]){
        e.preventDefault();
        e.stopPropagation();
        Ember.Blackout.preventNextClick();
      }
      
      _this.send('toggle','hide');
      
    }
  },
  
  actions: {
    getButton($el){
      this.set('button',$el);
    },
    toggle(force){
      
      let showItem = ($item)=>{
        $item.removeClass('hiding').off(Ember.Blackout.afterCSSAnimation);
        $item.addClass('showing');
      };
      
      let hideItem = ($item)=>{
        $item.addClass('hiding');
        $item.off(Ember.Blackout.afterCSSAnimation).on(Ember.Blackout.afterCSSAnimation,()=>{
          $item.removeClass('showing hiding');
          this.returnFromGlobal();
        });
      };
      
      let $panels = this.$('.action-box-content');
      let $blocker = this.$('.action-box-blocker');
      
      if(this.get('isShowing') && (!force || force==='hide')){
        
        hideItem($panels);
        hideItem($blocker);
        this.set('isShowing',false);
        
      } else if(!force || force==='show') {
        
        this.moveToGlobal();
        showItem($panels);
        showItem($blocker);
        this.set('isShowing',true);
        
      }
    },
  },
  
  moveToGlobal(){
    
    if(!this.get('isGlobal')){
      
      // Get position in body
      let pos = this.$().offset();
      
      // Get index
      this.set('domIndex',this.$().index());
      this.set('domParent',this.$().parent());
      this.set('isGlobal',true);
      
      Ember.$('body').append(this.$());
      
      this.$().css({
        position: 'fixed',
        left: pos.left,
        top: pos.top,
      });
      
    }
    
  },
  
  returnFromGlobal(){
    
    // Get index
    let index = this.get('domIndex');
    let $parent = this.get('domParent');
    
    $parent.insertAt(index,this.$());
    
    this.$().css({
      position: '',
      left: '',
      top: '',
    });
    
    this.set('isGlobal',false);
    
  },
  
});
