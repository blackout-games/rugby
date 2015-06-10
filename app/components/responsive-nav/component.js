import Ember from 'ember';
var $ = Ember.$;

export default Ember.Component.extend({
  testingSidebar: true,
  sidebarMinWait: 222,
  sidebarLastAction: 0,
  sidebarIsOpen: false,
  selector: '#sidebar,#backboard,#top-nav,#body',
  
  startListening: function(){
    this.get('EventBus').subscribe('showNav', this, Ember.run.bind(this,this.showSidebar));
    this.get('EventBus').subscribe('hideNav', this, Ember.run.bind(this,this.hideSidebar));
  }.on('didInsertElement'),
  
  stopListening: function(){
    this.get('EventBus').unsubscribe('showNav', this, Ember.run.bind(this,this.showSidebar));
    this.get('EventBus').unsubscribe('hideNav', this, Ember.run.bind(this,this.hideSidebar));
  }.on('willDestroyElement'),
  
  setup: function(){
    
    // Add element behind body to show on scroll bounce
    $('<div id="backboard"><div class="logo"></div></div>').insertBefore( $('#body') );
    
    // Always close sidebar on change
    this.media.tablet.onchange = Ember.run.bind(this, function(){
      this.get("controller").send('hideSidebar');
    });
    
    // For testing
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
    
    Ember.$(window).on('resize', Ember.run.bind(this, this.handleResize));
    
  }.on('didInsertElement'),
  
  clean: function(){
    
    this.media.tablet.onchange = null;
    
    Ember.$(window).off('resize', Ember.run.bind(this, this.handleResize));
    
  }.on('willDestroyElement'),
  
  handleResize: function(){
    $(this.get('selector')).addClass('resizing');
    Ember.run.debounce(this,this.cleanResize,200);
  },
  cleanResize: function(){
    $(this.get('selector')).removeClass('resizing');
  },
  
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
        
        $(this.get('selector')).addClass('open');
        $('#body').on('mousedown touchstart',Ember.run.bind(this,this.hideSidebar));
        this.set('sidebarLastAction',now);
        this.set('sidebarIsOpen',true);
        $('#navButton').addClass('nav-close');
      }
      
    },
    hideSidebar: function(){
      
      var now = Date.now();
      var timeSinceLast = now-this.get('sidebarLastAction');
      
      if( this.get('sidebarIsOpen') && timeSinceLast>this.get('sidebarMinWait') ){
        $(this.get('selector')).removeClass('open');
        $('#body').off('mousedown touchstart',Ember.run.bind(this,this.hideSidebar));
        this.set('sidebarLastAction',now);
        this.set('sidebarIsOpen',false);
        $('#navButton').removeClass('nav-close');
      }
      
    }
  },
  
  showSidebar: function(){
    this.send('showSidebar');
  },
  hideSidebar: function(){
    this.send('hideSidebar');
  },
  
  
});
