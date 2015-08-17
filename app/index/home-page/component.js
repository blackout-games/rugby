import Ember from 'ember';

export default Ember.Component.extend({
  contextElementId: '',
  currentYear: new Date().getFullYear(),
  
  fbLoginAction: 'loginWithFacebook',
  
  actions: {
    handleWaypoint: function(direction,element){
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
    loginWithFacebook: function(button){
      this.sendAction('fbLoginAction',button);
    },
  },
  
  setupLinks: function(){
    
    this.handleLinkBound = Ember.run.bind(this,this.handleLink);
    Ember.$('[id^=link-] > a').on('mousedown touchstart',this.handleLinkBound);
    
  }.on('didInsertElement'),
  
  cleanLinks: function(){
    
    if(this.handleLinkBound){
      Ember.$('[id^=link-] > a').off('mousedown touchstart',this.handleLinkBound);
    }
    
  }.on('willDestroy'),
  
  handleLink: function(){
    Ember.$('[id^=link-]').data('ignore-link',false);
    Ember.$(this).parent().addClass('active').siblings().removeClass('active').data('ignore-link',true);
  },
  
  waypointOffset: function(){
    return Math.round(Ember.$(window).height()*0.5);
  }.property(),
  
  scrollContextId: function(){
    return window.features.lockBody ? 'body' : null;
  }.property('window.features.lockBody'),
  
});
