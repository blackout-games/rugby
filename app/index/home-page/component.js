import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  contextElementId: '',
  currentYear: new Date().getFullYear(),
  userImages: Ember.inject.service(),
  locale: Ember.inject.service(),
  
  fbLoginAction: 'loginWithFacebook',
  
  arrive: Ember.on('didInsertElement', function(){
    this.get('EventBus').publish('hideBottomTabBar');
    $('#sidebar-info-tab').removeClass('hidden');
    
  }),
  
  leave: Ember.on('willDestroyElement', function(){
    this.get('EventBus').publish('showBottomTabBar');
    $('#sidebar-info-tab').addClass('hidden');
  }),

  initUserImages: Ember.on('didInsertElement', function() {
    
    if(this.get('session.isAuthenticated')){
      
      this.get('userImages').registerManagerImage('.manager-avatar-home',$('#nav-sidebar').css('background-color'));
      this.get('userImages').registerClubImage('.club-avatar-home',$('#nav-sidebar').css('background-color'));
      
    }
    
  }),
  
  actions: {
    handleWaypoint(direction, element) {
      var section = element.get('id');
      
      //log(section,direction);
      
      if( direction === "up" ){
        
        // Determine previous item
        var prevSection = element.$().prev().prev().attr('id');
        // Munges
        //if( prevSection === "numbers" ){
        //  prevSection = "about";
        //}
        
        if( prevSection ){
          section = prevSection;
        }
        
      }
      
      Ember.run.next(function(){
        if( !$('.scroll-link-'+section).data('ignore-link') ){
          $('.scroll-link-'+section).addClass('selected').siblings().removeClass('selected');
          $('[class^=scroll-link-]').data('ignore-link',false);
          
          Ember.Blackout.updateHashQuietly(section);
        }
      });
    },
    loginWithFacebook(button) {
      this.sendAction('fbLoginAction',button);
    },
    showMenu(){
      this.get('EventBus').publish('showNav');
    },
    showSettings(){
      this.get('EventBus').publish('showSettings');
    },
  },
  
  setupLinks: Ember.on('didInsertElement', function(){
    
    this.handleLinkBound = Ember.run.bind(this,this.handleLink);
    $('[id^=link-] > a').on('mousedown touchstart',this.handleLinkBound);
    
  }),
  
  cleanLinks: Ember.on('willDestroy', function(){
    
    if(this.handleLinkBound){
      $('[id^=link-] > a').off('mousedown touchstart',this.handleLinkBound);
    }
    
  }),
  
  handleLink() {
    $('[id^=link-]').data('ignore-link',false);
    $(this).parent().addClass('active').siblings().removeClass('active').data('ignore-link',true);
  },
  
  waypointOffset: Ember.computed(function(){
    return Math.round($(window).height()*0.5);
  }),
  
});
