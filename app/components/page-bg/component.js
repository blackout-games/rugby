import Ember from 'ember';

var images = {
  "dashboard": 8,
  "news": 6,
  "rugby": 5,
};

export default Ember.Component.extend({
  classNames: ['page-bg'],
  baseClasses: ['page-header-bg vf-child'],
  
  startListening: Ember.on('init',function(){
    
    this.get('EventBus').subscribe('setNewBackground', this, this.newBackground);
    this.get('EventBus').subscribe('setNewBackgrounds', this, this.newBackgrounds);
    this.get('EventBus').subscribe('removeBackground', this, this.removeBackground);
    
  }),
  
  newBackground( url ){
    this.set('imageURL',url);
  },
  
  newBackgrounds( group ){
    this.set('images',group);
  },
  
  removeBackground(){
    this.set('imageURL',false);
    this.set('images',false);
  },
  
  defaultColor: Ember.computed( function(){
    return Ember.Blackout.getCSSValue('background-color','bg-dark');
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
