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
  baseClasses: ['page-header-bg'],
  height: '25vh',
  
  defaultColor: Ember.computed( function(){
    return Ember.Blackout.getCSSValue('background-color','bg-dark');
  }),
  
  setHeight: Ember.on( 'didInsertElement', function(){
    
    // Adjust
    this.$().findClosest('.page-header').css({
      'min-height': this.get('height'),
      'padding-top': '33px',
    });
    
  }),
  
  imageClass: Ember.computed('imageURL','images', function(){
    
    if( this.get('imageURL') ){
      
      // image should be a URL
      var url = Ember.Blackout.assertURL(this.get('imageURL'));
      
      // Get a unique className
      var className = 'page-header-' + url.hashCode();
      
      // Create a fresh css pseudo rule
      Ember.Blackout.addCSSRule( '.' + className + ':before', 'background-image: url('+url+') !important;');
      
      return this.get('baseClasses').join(' ') + ' ' + className;
      
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
        
        return this.get('baseClasses').join(' ') + ' ' + imageClass;
        //this.$().addClass(imageClass);
        
      }
      
    }
    
  }),
  
});
