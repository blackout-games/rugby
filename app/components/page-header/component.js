import Ember from 'ember';

var images = {
  "dashboard": 8,
  "news": 6,
  "rugby": 5,
};

/**
 * Attributes:
 * 
 * images: image list to choose from
 * route: the route name to use to remember the image picked (allows multiple routes to use the same images list, but not have the same image)
 * 
 */

export default Ember.Component.extend({
  classNames: ['page-header','clearfix'],
  
  pickOne: function(){
    
    if( this.get('images') ){
      
      var key = this.get('images');
      
      if( images[key] ){
        
        var session = this.get('session');
        
        var route = this.get('route');
        if(!route){
          route = key;
        }
        
        // Check if we've been here
        var sessionKey = route+'-header-image';
        var imageClass = session.get(sessionKey);
        
        if(!imageClass){
          var available = images[this.get('images')];
          var image = Ember.Blackout.rand(1,available);
          imageClass = key + '-' + image;
          session.set(sessionKey,imageClass);
        }
        
        this.$().addClass(imageClass);
        
      }
      
    }
    
  }.on('didInsertElement'),
  
});
