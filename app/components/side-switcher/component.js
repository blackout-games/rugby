import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  
  classNames: ['switcher-window'],
  direction: 'right',
  currentlyShowing: '', // #id or element
  currentOldObj: null,
  
  setup: Ember.on('didInsertElement', function(){
    
    // Force child panels to full width
    this.$().findClosest('.switcher-children').children().addClass('switcher-panel');
    
    // Show first item by default
    if( this.get('currentlyShowing') === '' ){
      this.set( 'currentlyShowing', this.$().findClosest('switcher-children').children().first()[0] );
    } else {
      this.show();
    }
    
    // Bind functions
    this.afterAnimationBound = Ember.run.bind(this,this.afterAnimation);
    
  }),
  
  show() {
    
    var direction = this.get('direction');
    var oldObj = this.get('previouslyShowing');
    var currentlyShowing = this.get('currentlyShowing');
    var newObj;
    
    if( typeof(currentlyShowing) === 'string' ){
      newObj = $('#'+currentlyShowing);
    } else {
      newObj = $(currentlyShowing);
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
  
  //showNewMenu: Ember.on('didUpdateAttrs',function(options){
  didUpdateAttrs(options){
    
    if(options.newAttrs.currentlyShowing !== options.oldAttrs.currentlyShowing){
      
      this.show();
      
    }
    
  },
  
  disableAnimation() {
    var pane = this.$().findClosest('.switcher-pane');
    pane.addClass('switcher-ready-disable');
  },
  
  putAway( obj ){
    obj.appendTo(this.$().findClosest('.switcher-children'));
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
    
    if( !dontReset ){
      
      // Set left
      pane.addClass('switcher-ready-' + ready);
      
      // Move right
      Ember.run.next(function(){
        pane.addClass('switcher-move-' + direction);
        pane.removeClass('switcher-ready-' + ready);
      });
      
    } else {
      
      // Move right
      pane.addClass('switcher-move-' + direction);
      
    }
    
    // Detect end of animation
    this.set('currentOldObj',oldObj);
    pane.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', this.afterAnimationBound);
    
    // Track current direction
    this.set('currentDirection',direction);
    
  },
  
  afterAnimation () {
    if(this.get('currentOldObj')){
      this.putAway( this.get('currentOldObj') );
      this.set('currentOldObj',null);
      this.set('currentDirection',null);
    }
  },
  
  resetPane() {
    var pane = this.$().findClosest('.switcher-pane');
  
    pane.removeClass(function (index, css) {
      return (css.match (/(^|\s)switcher-ready-\S+/g) || []).join(' ');
    });
      
    pane.removeClass(function (index, css) {
      return (css.match (/(^|\s)switcher-move-\S+/g) || []).join(' ');
    });
  },
  
});
