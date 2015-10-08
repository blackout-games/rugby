import Ember from 'ember';

export default Ember.Component.extend({
  contextElementId: '',
  currentYear: new Date().getFullYear(),
  
  fbLoginAction: 'loginWithFacebook',
  
  actions: {
    handleWaypoint(direction, element) {
      var section = element.get('id');
      
      if( direction === "up" ){
        
        // Determine previous item
        var prevSection = element.$().prev().prev().attr('id');
        // Munges
        if( prevSection === "numbers" ){
          prevSection = "about";
        }
        
        if( prevSection ){
          section = prevSection;
        }
        
      }
      
      if( !Ember.$('#link-'+section).data('ignore-link') ){
        Ember.$('#link-'+section).addClass('active').siblings().removeClass('active');
        Ember.$('[id^=link-]').data('ignore-link',false);
      }
    },
    loginWithFacebook(button) {
      this.sendAction('fbLoginAction',button);
    },
  },
  
  setupLinks: Ember.on('didInsertElement', function(){
    
    this.handleLinkBound = Ember.run.bind(this,this.handleLink);
    Ember.$('[id^=link-] > a').on('mousedown touchstart',this.handleLinkBound);
    
  }),
  
  cleanLinks: Ember.on('willDestroy', function(){
    
    if(this.handleLinkBound){
      Ember.$('[id^=link-] > a').off('mousedown touchstart',this.handleLinkBound);
    }
    
  }),
  
  handleLink() {
    Ember.$('[id^=link-]').data('ignore-link',false);
    Ember.$(this).parent().addClass('active').siblings().removeClass('active').data('ignore-link',true);
  },
  
  waypointOffset: Ember.computed(function(){
    return Math.round(Ember.$(window).height()*0.5);
  }),
  
  scrollContextId: Ember.computed('window.features.lockBody', function(){
    return window.features.lockBody ? 'body' : null;
  }),
  
});
