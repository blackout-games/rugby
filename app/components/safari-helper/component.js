import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  
  classNames: ['safari-helper'],
  minSeenHeight: 10000,
  maxSeenHeight: 0,
  messageHeight: 44,
  round: Math.round,
  min: Math.min,
  
  setup:function(){
    
    if( window.browsers.safariOS && !window.navigator.standalone && this.media.isMobile /*&& this.get('session.isAuthenticated')*/ ){
      
      this.checkHeight();
      
      this.checkHeightBound = Ember.run.bind(this,this.checkHeight);
      $(window).on('scroll',this.checkHeightBound);
      
      this.startWatchingBound = Ember.run.bind(this,this.startWatching);
      $(document).on('touchstart',this.startWatchingBound);
      
      this.stopWatchingBound = Ember.run.bind(this,this.stopWatching);
      $(document).on('touchend',this.stopWatchingBound);
      
      this.$().show();
      
    }
    
  }.on('didInsertElement'),
  
  clean: function(){
    
    if( this.checkHeightBound ){
      $(window).off('scroll',this.checkHeightBound);
    }
    
    if( this.startWatchingBound ){
      $(document).off('touchstart',this.startWatchingBound);
    }
    
    if( this.stopWatchingBound ){
      $(document).off('touchend',this.stopWatchingBound);
    }
    
  }.on('willDestroyElement'),
  
  startWatching: function(e){
    
    if($(e.target).parents('.safari-helper').length > 0){
      
    } else {
      this.checkHeight('watch');
    }
  },
  
  stopWatching: function(){
    var watchEvent = this.get('watchEvent');
    if(watchEvent){
      Ember.run.cancel(watchEvent);
      this.set('watchEvent',null);
    }
  },
  
  checkHeight: function(e){
    
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
      
      this.$().find('.safari-message').slideDown(150,'linear');
      
    } else if(e === 'watch' || e === 'lag') {
      var barHeight = this.min(44,this.round((currentHeight - minSeenHeight)*(44/69)));
      
      //this.$().find('.safari-message').css('height',barHeight + 'px');
      
      if(barHeight === 44){
        this.$().find('.safari-message').slideDown(150,'linear');
      } else if(barHeight === 0 && !this.get('contentIsShowing')){
        this.$().find('.safari-message').slideUp(150,'linear');
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
    close: function(){
      this.clean();
      this.$().slideUp('fast');
    },
    showContent: function(){
      
      if( this.get('contentIsShowing') ){
        this.$().find('.safari-content').slideUp('fast');
        this.set('contentIsShowing',false);
      } else {
        this.$().find('.safari-content').slideDown('fast');
        this.set('contentIsShowing',true);
      }
      
    },
  },
  
});