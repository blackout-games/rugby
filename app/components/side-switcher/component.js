import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  
  classNames: ['switcher-window','col-flex'],
  direction: 'immediate',
  currentlyShowing: '', // #id or element
  currentOldObj: null,
  switchCallback: null,
  afterSwitchCallback: null,
  allowHeightAnimation: false,
  
  /**
   * Set this to false to disable all sliding
   * @type {Boolean}
   */
  allowAnimation: true,
  
  setup: Ember.on('didInsertElement', function(){
    
    // Get all tab panels and save for use outside of the switcher (e.g. blackout-tabs)
    let panels = [];
    this.$().findClosest('.switcher-children').children().each((i,panel)=>{
      panels.push($(panel));
    });
    
    Ember.run.schedule('afterRender',this,()=>{
      
      if(this.attrs.receivePanels){
        this.attrs.receivePanels(panels);
      }
      
      // Show first item by default
      if( Ember.Blackout.isEmpty(this.get('currentlyShowing')) ){
        this.set( 'currentlyShowing', this.$().findClosest('.switcher-children').children().first()[0].id );
      } else {
        this.show();
      }
      
    });
    
    // Force child panels to full width
    this.$().findClosest('.switcher-children').children().addClass('switcher-panel');
    
    // Bind functions
    this.afterAnimationBound = Ember.run.bind(this,this.afterAnimation);
    
    // Don't animate height on touch OS's (too slow, for now)
    /**
     * Animating height is an all round bad idea. It doesn't work every time even on desktop, messes up many things, and slow performance heavily on mobile.
     */
    if(window.os.touchOS || !this.get('allowHeightAnimation') || true){
      this.$().findClosest('.switcher-pane').addClass('dont-animate-height');
    }
    
  }),
  
  show() {
    
    var direction = this.get('direction');
    var oldObj = this.get('previouslyShowing');
    var currentlyShowing = this.get('currentlyShowing');
    var newObj;
    
    // Ensure defaults
    if(direction!=='immediate' && direction!=='left' && direction!=='right'){
      direction = 'immediate';
    }
    let allowAnimation = this.get('allowAnimation');
    if(!allowAnimation){
      direction = 'immediate';
      this.set('direction','immediate');
    }
    
    if( typeof(currentlyShowing) === 'string' ){
      newObj = this.$('#'+currentlyShowing);
    } else {
      newObj = this.$(currentlyShowing);
    }
    
    if(!$(newObj).length){
      Ember.Logger.warn("Side-switcher panel (" + currentlyShowing + ") not found");
      return;
    }
    
    // Don't do anything if there's no change
    if( oldObj && newObj[0] === oldObj[0] ){
      return;
    }
    
    this.resetPane();
    
    // Check if new object is being moved out
    var currentOldObj = this.get('currentOldObj');
    var currentDirection = this.get('currentDirection');
    
    if( currentOldObj && newObj[0] === currentOldObj[0] ){
      
      // Run in opposition direction, without resetting
      if( currentDirection === 'left' ){
        this.moveRight( newObj, oldObj, true );
      } else {
        this.moveLeft( newObj, oldObj, true );
      }
    
    // Else run set direction
    } else if( direction === 'immediate' ){
      
      if(oldObj){
        this.putAway( oldObj );
      }
      this.disableAnimation();
      this.putLeft( newObj );
      
    } else if( direction === 'left' ){
      
      if(oldObj){
        this.putLeft( oldObj );
      }
      this.putRight( newObj );
      this.moveLeft( newObj, oldObj );
      
    } else if( direction === 'right' ){
      
      if(oldObj){
        this.putRight( oldObj );
      }
      this.putLeft( newObj );
      this.moveRight( newObj, oldObj );
      
    }
    
    this.set('previouslyShowing',newObj);
    
  },
  
  didUpdateAttrs(options){
      
    if(this.attrChanged(options,'currentlyShowing')){
      this.show();
    }
    
  },
  
  disableAnimation() {
    var pane = this.$().findClosest('.switcher-pane');
    pane.addClass('switcher-ready-disable');
  },
  
  /**
   * DOM movements are slow. So we don't call this after animation anymore.
   * We hideAway instead
   */
  putAway( $obj ){
    $obj.appendTo(this.$().findClosest('.switcher-children'));
  },
  
  hideAway( $obj ){
    $obj.hide();
  },
  
  putRight( obj ){ this.putInPane( obj, 'right' ); },
  putLeft( obj ){ this.putInPane( obj, 'left' ); },
  
  putInPane( obj, pane ){
    
    var prevObj = this.$().findClosest('.switcher-'+pane+'-pane').children().first();
    if(prevObj){
      this.putAway(prevObj);
    }
    obj.appendTo(this.$().findClosest('.switcher-'+pane+'-pane'));
    
  },
  
  moveRight( newObj, oldObj, dontReset ){
    this.movePane( newObj, oldObj, 'right', dontReset );
  },
  moveLeft( newObj, oldObj, dontReset ){
    this.movePane( newObj, oldObj, 'left', dontReset );
  },
  
  movePane( newObj, oldObj, direction, dontReset ){
    
    var pane = this.$().findClosest('.switcher-pane');
    var ready = direction === 'right' ? 'left' : 'right';
    
    // Must run next to get correct height
    // Set height before switching for smoothest effect
    
    Ember.run.next(()=>{
      pane.css({
        // Use outerHeight on item with .clearfix applied to 
        // get accurate height reading
        //height: $(newObj).outerHeight() + 'px',
        height: $(newObj).outerHeight() + 'px',
      });
    });
    
    //$(newObj).show();
  
    if( !dontReset ){
      
      // Set ready
      pane.addClass('switcher-ready-' + ready);
      
      // Move
      Ember.run.later(function(){
        pane.addClass('switcher-move-' + direction);
        pane.removeClass('switcher-ready-' + ready);
      },44);
      
    } else {
      
      // Move
      pane.addClass('switcher-move-' + direction);
      
    }
    
    // Run callback if exists
    if(this.get('switchCallback')){
      this.get('switchCallback')();
    }
    
    // Detect end of animation
    this.set('currentOldObj',oldObj);
    pane.off(Ember.Blackout.afterCSSTransition).one(Ember.Blackout.afterCSSTransition, this.afterAnimationBound);
    
    // Track current direction
    this.set('currentDirection',direction);
    
  },
  
  afterAnimation () {
    
    if(this.get('currentOldObj')){
      this.putAway( this.get('currentOldObj') );
      //this.hideAway( this.get('currentOldObj') );
      this.set('currentOldObj',null);
      this.set('currentDirection',null);
    }
    
    // Height stretchability reset
    var pane = this.$().findClosest('.switcher-pane');
    pane.css('height','auto');
    
    // Run callback if exists
    if(this.get('afterSwitchCallback')){
      this.get('afterSwitchCallback')();
    }
  },
  
  resetPane() {
    var pane = this.$().findClosest('.switcher-pane');
    
    // Must happen to ensure height is reset between routes, e.g. when switching players in player view
    // Breaks height animation, but oh well.
    // It's too difficult to tell the difference between a normal switch, and a switch because the route has changed.
    // Nope, see 'resetHeight'
    /*pane.css({
      height: 'auto',
    });*/
    
    pane.removeClass(function (index, css) {
      return (css.match (/(^|\s)switcher-ready-\S+/g) || []).join(' ');
    });
      
    pane.removeClass(function (index, css) {
      return (css.match (/(^|\s)switcher-move-\S+/g) || []).join(' ');
    });
  },
  
  /**
   * By passing any model into this component, we can let it know when to reset it's height completely. e.g. switching players on the player page/
   */
  /*resetHeight: Ember.observer('model',function(){
    var pane = this.$().findClosest('.switcher-pane');
    pane.css({
      height: 'auto',
    });
  }),*/
  
});
