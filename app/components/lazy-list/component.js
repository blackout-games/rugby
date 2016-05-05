import Ember from 'ember';

/**
 * The purpose of the lazy list component is to handle long lists that contain heavy UI content that may crash some mobile browsers. By displaying content over time, we relieve pressure on the browser.
 * 
 * This has fixed crashing in particular with Chrome on iOS on the squad page.
 * 
 * Crash causers:
 *   
 *   - Displaying all items at once
 *   - Applying 3d acceleration to all items (We need 3d because without it z-indexes get jumbled on some mobile browsers during scrolling, namely Chrome on iOS as of Dec 2015)
 * 
 * Current strategy:
 * 
 *   - Apply 3d acceleration on items visible on screen or near to being on screen
 *   - Display items one by one (After the first 3 by default) until all are displayed
 *     Except on chrome ios, and standalone on iOS. We must use the 'showOnScroll' strategy, otherwise too many visible items can still cause crashes.
 *   
 *   Showing on scroll is a bad UX because on mobile browsers where scroll events aren't reported until scrolling finishes, the user can see a blank background for a while - however, we must use this strategy sometimes to prevent crashes.
 *   
 */

export default Ember.Component.extend({
  
  showFirst: 3,
  hideClass: 'invisible',
  strategy: 'showOnTimer', // showOnTimer | showOnScroll
  screensToRender: 4, // Even 3 still sometimes crashes on Chrome on iPad 3, so just go higher.
  
  setup: Ember.on('init',function(){
    
    let token = Ember.Blackout.generateId();
    let screensToRender = this.get('screensToRender');
    
    this.set('token',token);
    this.set('waypointDownOffset',Ember.$(window).height() * screensToRender);
    this.set('waypointUpOffset',Ember.$(window).height() * -screensToRender);
    this.set('itemId','list-item-' + token);
    this.showNextItemBound = Ember.run.bind(this,this.showNextItem);
    
    if( window.browsers.chromeiOS || window.browsers.standalone ){
      this.set('strategy','showOnScroll');
    }
    
  }),
  
  lazyList: Ember.computed('list',function(){
    let lazyList = [];
    let list = this.get('list');
    list.forEach((item,i) => {
      lazyList.pushObject(i);
    });
    return lazyList;
  }),
  
  actions: {
    waypointDown(direction,obj){
      //print('TOWARDS DOWN',(direction==='down'?'towards':'away'),obj.index);
      
      if(direction === 'down'){
        
        //this.$('#' + obj.itemId).addClass('make3d');
        
        if( this.get('strategy') === 'showOnScroll' ){
          this.$('#' + obj.itemId).removeClass(this.get('hideClass'));
        }
        
      } else {
        
        // Causes display issues
        //this.$('#' + obj.itemId).removeClass('make3d');
        
        if( this.get('strategy') === 'showOnScroll' ){
          this.$('#' + obj.itemId).addClass(this.get('hideClass'));
        }
        
      }
      
    },
    waypointUp(direction,obj){
      //print('TOWARDS UP',(direction==='up'?'towards':'away'),obj.index);
      
      if(direction === 'up'){
        
        //this.$('#' + obj.itemId).addClass('make3d');
        
        if( this.get('strategy') === 'showOnScroll' ){
          this.$('#' + obj.itemId).removeClass(this.get('hideClass'));
        }
        
      } else {
        
        // Causes display issues
        //this.$('#' + obj.itemId).removeClass('make3d');
        
        if( this.get('strategy') === 'showOnScroll' ){
          this.$('#' + obj.itemId).addClass(this.get('hideClass'));
        }
      }
      
    },
  },
  
  showTheRest: Ember.on('didInsertElement',function(){
    
    if( this.get('strategy') === 'showOnTimer' ){
      
      this.set('currentItem',this.get('showFirst'));
      window.setTimeout(this.showNextItemBound,1000);
      
    }
    
  }),
  
  showNextItem(){
    
    let i = this.get('currentItem');
    let itemId = '#' + this.get('itemId') + '-' + i;
    
    // Make sure item exists
    if( !this.get('isDestroyed') && this.$(itemId) && this.$(itemId).length ){
      
      this.$(itemId).removeClass(this.get('hideClass'));
      //log('showed',i);
      this.set('currentItem',i+1);
      
      window.setTimeout(this.showNextItemBound,100);
      
    }
    
    // Else we're done
    
  },
  
});
