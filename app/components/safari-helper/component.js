import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  
  classNames: ['safari-helper'],
  minSeenHeight: 10000,
  maxSeenHeight: 0,
  messageHeight: 44,
  round: Math.round,
  min: Math.min,
  testing: false,
  
  setup:Ember.on('didInsertElement', function(){
    
    if( this.get('testing') || (window.browsers.safariOS && !window.navigator.standalone && this.media.isMobile) /*&& this.get('session.isAuthenticated')*/ ){
      
      this.checkHeight();
      
      this.checkHeightBound = Ember.run.bind(this,this.checkHeight);
      $(window).on('scroll',this.checkHeightBound);
      
      this.startWatchingBound = Ember.run.bind(this,this.startWatching);
      $(document).on('touchstart',this.startWatchingBound);
      
      this.stopWatchingBound = Ember.run.bind(this,this.stopWatching);
      $(document).on('touchend',this.stopWatchingBound);
      
      this.$().show();
      
      if(this.get('testing')){
        this.send('showMessage');
      }
      
    }
    
  }),
  
  clean: Ember.on('willDestroyElement', function(){
    
    if( this.checkHeightBound ){
      $(window).off('scroll',this.checkHeightBound);
    }
    
    if( this.startWatchingBound ){
      $(document).off('touchstart',this.startWatchingBound);
    }
    
    if( this.stopWatchingBound ){
      $(document).off('touchend',this.stopWatchingBound);
    }
    
  }),
  
  startWatching(e) {
    
    if($(e.target).parents('.safari-helper').length > 0){
      
    } else {
      this.checkHeight('watch');
    }
  },
  
  stopWatching() {
    var watchEvent = this.get('watchEvent');
    if(watchEvent){
      Ember.run.cancel(watchEvent);
      this.set('watchEvent',null);
    }
  },
  
  checkHeight(e) {
    
    var minSeenHeight = this.get('minSeenHeight');
    var maxSeenHeight = this.get('maxSeenHeight');
    var currentHeight = window.innerHeight;
    var minSeenHeightNew,maxSeenHeightNew;
    
    if( currentHeight < minSeenHeight ){
      minSeenHeightNew = currentHeight;
      this.set('minSeenHeight',minSeenHeightNew);
    }
    if( currentHeight > maxSeenHeight ){
      maxSeenHeightNew = currentHeight;
      this.set('maxSeenHeight',maxSeenHeightNew);
    }
    
    if( e && maxSeenHeightNew && maxSeenHeightNew - maxSeenHeight > 10 && maxSeenHeight !== 0 ){
      
      //this.$().find('.safari-message').css('height',this.get('messageHeight') + 'px');
      
      this.send('showMessage');
      
    } else if(e === 'watch' || e === 'lag') {
      var barHeight = this.min(44,this.round((currentHeight - minSeenHeight)*(44/69)));
      
      //this.$().find('.safari-message').css('height',barHeight + 'px');
      
      if(barHeight === 44){
        this.send('showMessage');
      } else if(barHeight === 0 && !this.get('contentIsShowing')){
        this.send('hideMessage');
      }
    }
    
    if( e === 'watch' ){
      
      var self = this;
      var runLater = Ember.run.later(function(){
        self.checkHeight(e);
      },1000/60);
      this.set('watchEvent',runLater);
      
      // Keep watching for a while
      Ember.run.later(function(){
        self.checkHeight('lag');
      },222);
      
    }
    
  },
  
  actions: {
    
    // ----------- Message
    
    showMessage() {
      if(!this.get('showingMessage')){
        this.$().find('.safari-message').slideDown(150,'linear');
        print('showing message');
        var yOffset = parseInt(Ember.Blackout.getCSSValue('height','safari-message'));
        this.EventBus.publish('fixedItemsShift',{x:0,y:-yOffset},200);
        this.set('showingMessage',true);
      }
    },
    
    hideMessage() {
      if(this.get('showingMessage')){
        this.$().find('.safari-message').slideUp(150,'linear');
        print('hiding message');
        this.EventBus.publish('fixedItemsShift',{x:0,y:0},200);
        this.set('showingMessage',false);
      }
    },
    
    // ----------- Full information
    
    close() {
      this.clean();
      this.$().slideUp(200);
      print('shifting bak');
      this.EventBus.publish('fixedItemsShift',{x:0,y:0},200);
    },
    showContent() {
      
      if( this.get('contentIsShowing') ){
        this.$().find('.safari-content').slideUp(200);
        this.set('contentIsShowing',false);
        
        // Let other fixed elements know to move
        print('shifting bak');
        this.EventBus.publish('fixedItemsShift',{x:0,y:0},200);
      } else {
        this.$().find('.safari-content').slideDown(200);
        this.set('contentIsShowing',true);
      }
      
    },
  },
  
});
