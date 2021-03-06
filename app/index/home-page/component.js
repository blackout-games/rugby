import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  contextElementId: '',
  currentYear: new Date().getFullYear(),
  userImages: Ember.inject.service(),
  locale: Ember.inject.service(),
  
  fbLoginAction: 'loginWithFacebook',
  
  arrive: Ember.on('didInsertElement', function(){
    this.get('eventBus').publish('hideBottomTabBar');
    $('#sidebar-info-tab').removeClass('hidden');
    
  }),
  
  leave: Ember.on('willDestroyElement', function(){
    this.get('eventBus').publish('showBottomTabBar');
    $('#sidebar-info-tab').addClass('hidden');
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
      this.get('eventBus').publish('showNav');
    },
    toggleSettings(){
      if(!this.get('media.isJumbo')){
        this.get('eventBus').publish('showSettings');
      } else {
        this.get('eventBus').publish('toggleSettings');
      }
      
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
