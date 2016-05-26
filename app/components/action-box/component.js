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
  outerPaddingSides: 10,
  
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
    
    let panelsSelector = '.action-box-button-panel, .action-box-content-panel, .action-box-button,.bs-options' + (_this.get('ignore') ? ','+_this.get('ignore') : '');
    //let $panels = _this.$(panelsSelector);
    
    if(!Ember.$(e.target).hasParent(panelsSelector)){
      
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
    hide(){
      this.send('toggle','hide');
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
      
      this.set('domStyles',this.$().attr("style"));
      this.set('buttonStyles',this.$('.action-box-button a').attr("style"));
      this.set('isGlobal',true);
      
      // Save box styles on element itself
      let stylesToSave = ['line-height','height'];
      let styles = window.getComputedStyle(this.$()[0]);
      stylesToSave.forEach((propName)=>{
        this.$().css(propName,styles.getPropertyValue(propName));
      });
      
      // Save button styles on element itself
      stylesToSave = ['font-family','font-weight','color','font-size','text-transform','top','left','right','bottom','padding-left','padding-right','padding-bottom','padding-top','margin-left','margin-right','margin-bottom','margin-top','line-height'];
      styles = window.getComputedStyle(this.$('.action-box-button a')[0]);
      stylesToSave.forEach((propName)=>{
        this.$('.action-box-button').css(propName,styles.getPropertyValue(propName));
      });
      
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
    let styles = this.get('domStyles');
    let buttonStyles = this.get('buttonStyles');
    
    $parent.insertAt(index,this.$());
    
    this.$().css({
      position: '',
      left: '',
      top: '',
    });
    
    this.$().attr("style", styles ? styles : '');
    this.$('.action-box-button a').attr("style", buttonStyles ? buttonStyles : '');
    this.set('isGlobal',false);
    
  },
  
});
