import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  testingSidebar: true,
  sidebarMinWait: 222,
  sidebarLastAction: 0,
  sidebarIsOpen: false,
  
  setup: function(){
    
    // Always close sidebar on change
    this.media.tablet.onchange = Ember.run.bind(this, function(){
      this.get("controller").send('hideSidebar');
    });
    
    if(this.get('testingSidebar')){
      this.get('controller').send('showSidebar');
      this.media.tablet.onchange = Ember.run.bind(this, function(){
        this.get("controller").send('showSidebar');
      });
    }
    
    // Implement own scrolling in Chrome on iOS
    if(window.features.lockBody){
      Ember.$('html, body').css({
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      });
      Ember.$('#body').css({
        position: 'relative',
        height: '100vh',
        'overflow': 'scroll', /* has to be scroll, not auto */
        '-webkit-overflow-scrolling': 'touch',
      });
      // Move sidebar out of main container so that css 'fixed' works properly
      this.$().before(Ember.$('#sidebar'));
    }
    
  }.on('didInsertElement'),
  
  clean: function(){
    
    this.media.tablet.onchange = null;
    
  }.on('willDestroyElement'),
  
  smallMode: function(){
    return Ember.Blackout.isSmallMode(this);
  }.property('media.isMobile'),
  
  actions: {
    toggleMenu: function(){
      
      if(this.get('media.isTablet') || this.get('media.isMobile')){
        if( this.get('sidebarIsOpen') ){
          this.send('hideSidebar');
        } else {
          this.send('showSidebar');
        }
      }
      
    },
    showSidebar: function(){
      
      var now = Date.now();
      var timeSinceLast = now-this.get('sidebarLastAction');
      
      if( !this.get('sidebarIsOpen') && timeSinceLast>this.get('sidebarMinWait') ){
        
        $('#sidebar').addClass('open');
        $('#body').addClass('open').on('mousedown touchstart',Ember.run.bind(this,this.closeSidebar));
        this.set('sidebarLastAction',now);
        this.set('sidebarIsOpen',true);
        //var sT = $(window).scrollTop();
        $('#body').addClass('allowScrollTransition');
        //$('#body').scrollTop(sT);
        Ember.run.later(this,function(){
          //$('html,body').removeClass('allowScrollTransition');
        },300);
      }
      
    },
    hideSidebar: function(){
      
      var now = Date.now();
      var timeSinceLast = now-this.get('sidebarLastAction');
      
      if( this.get('sidebarIsOpen') && timeSinceLast>this.get('sidebarMinWait') ){
        $('#sidebar').removeClass('open');
        $('#body').removeClass('open').off('mousedown touchstart',Ember.run.bind(this,this.closeSidebar));
        this.set('sidebarLastAction',now);
        this.set('sidebarIsOpen',false);
        $('#body').addClass('allowScrollTransition');
        Ember.run.later(this,function(){
          // Sync scroll position
          //var sT = $('#body').scrollTop();
          $('#body').removeClass('allowScrollTransition');
          //$(window).scrollTop(sT);
        },300);
      }
      
    }
  },
  closeSidebar: function(){
    this.send('hideSidebar');
  },
  
  
});
