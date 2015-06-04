import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    "handleWaypoint": function(direction,element){
      var section = element.get('id');
      
      if( direction === "up" ){
        
        // Determine previous item
        var prevSection = element.$().parent().prev().children().first().attr('id');
        if( prevSection ){
          section = prevSection;
        }
        
      }
      
      if( !Ember.$('#link-'+section).data('ignore-link') ){
        Ember.$('#link-'+section).addClass('active').siblings().removeClass('active');
        Ember.$('[id^=link-]').data('ignore-link',false);
      }
    }
  }
});
