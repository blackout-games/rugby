import Ember from 'ember';
//var $ = Ember.$;

var images = {
  "dashboard": 8,
  "news": 6,
  "rugby": 5,
};

/**
 * Attributes:
 * 
 * image: [optional] image URL
 * images: [optional] image list to choose from
 * route: [optional] the route name to use to remember the image picked (allows multiple routes to use the same images list, but not have the same image)
 * height: [optional] min-height for the header
 * 
 */

export default Ember.Component.extend({
  classNames: ['page-header','clearfix','vb-parent'],
  height: '25vh',
  
  setHeight: Ember.on( 'didInsertElement', function(){
    
    // Adjust
    this.$().css({
      'min-height': this.get('height'),
      'padding-top': '33px',
    });
    
  }),
  
  pickOne: Ember.on('didInsertElement', function(){
    
    if( this.get('image') ){
      
      var url = Ember.Blackout.assertURL(this.get('image'));
      
      // image should be a URL
      Ember.Blackout.addCSSRule( '.page-header.specified:before', 'background-image: url('+url+') !important;');
      this.$().addClass('specified');
      
    } else if( this.get('images') ){
      
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
    
  }),
  
});
