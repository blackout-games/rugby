import Ember from 'ember';
var  $ = Ember.$;

/**
 * Timer wrapper library which supports waiting when window/tab is inactive
 * as well as pausing/resuming all timers added to this object.
 * 
 * User addTimer just as you would use setTimeout.
 */
export default Ember.Mixin.create({
  
  timerStore: [],
  
  timerWatchWindow () {
    
    if( !this.timerWatchingWindow ){
      
      var self = this;
      
      $([window,document]).blur(function(){
        self.pauseTimers( true );
      }).focus(function(){
        self.resumeTimers( true );
      });
      
      $([window,document]).trigger('focus');
      
      this.timerWatchingWindow = true;
      
    }
    
  },
  
  addTimer ( callback, delay, waitOnBlur, timerID ) {
    
    var timeoutID;
    var timerStore = this.timerStore;
    
    timeoutID = window.setTimeout( function(){
      
      timerStore.splice(timerID, 1);
      callback();
      
    }, delay );
    
    // Timer ID never changes, even after pausing and resuming with new timers.
    if( ! timerID ){
      timerID = timeoutID;
    }
    
    timerStore[timerID] = {
      'id': timerID,
      'currentTimeoutID': timeoutID,
      'started': Date.now(),
      'delay': delay,
      'waitOnBlur': waitOnBlur,
      'paused': false,
      'callback': callback,
    };
    
    this.timerWatchWindow();
    
    return timerID;
    
  },
  
  cancelTimer ( timerOrID ) {
    
    var timer = this.getTimer(timerOrID);
    
    if( timer ){
      window.clearTimeout(timer.currentTimeoutID);
      this.timerStore.splice(timer.id, 1);
    }
    
  },
  
  pauseTimer ( timerOrID ) {
    
    var timer = this.getTimer(timerOrID);
    
    if( timer ){
      
      let now = Date.now();
      window.clearTimeout(timer.currentTimeoutID);
      timer.paused = true;
      timer.delay = timer.delay - (now-timer.started);
      
      // Save updates to store
      this.timerStore[timer.id] = timer;
      
    }
    
  },
  
  resumeTimer ( timerOrID ) {
    
    var timer = this.getTimer(timerOrID);
    
    if( timer ){
      this.addTimer( timer.callback, timer.delay, timer.waitOnBlur, timer.id );
    }
    
  },
  
  cancelTimers () {
    
    var timerStore = this.timerStore;
    var self = this;
    
    timerStore.forEach(function(timer){
      
      self.cancelTimer(timer);
      
    });
    
  },
  
  pauseTimers ( windowBlurred ) {
    
    var timerStore = this.timerStore;
    var self = this;
    
    timerStore.forEach(function(timer){
      
      if( ( ! windowBlurred || timer.waitOnBlur ) && ! timer.paused ){
        
        self.pauseTimer(timer);
        
      }
      
    });
    
  },
  
  resumeTimers ( windowBlurred ) {
    
    var timerStore = this.timerStore;
    var self = this;
    
    timerStore.forEach(function(timer){
      
      if( ( ! windowBlurred || timer.waitOnBlur ) && timer.paused ){
        
        self.resumeTimer(timer);
        
      }
      
    });
  },
  
  getTimer ( timerOrID ) {
    if( typeof timerOrID === 'object' ){
      return timerOrID;
    } else {
      return this.timerStore[timerOrID];
    }
  },
  
});
