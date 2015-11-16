import Ember from 'ember';

var imagesList = {
  //"dashboard": ['fancy','club-office','design','glass','green','lamps','loft','plant'],
  "dashboard": ['green','design','glass','design2'],
  //"dashboard": ['green'],
  "news": ['boss','desks','hq','office','two-desk'],
  //"news": ['wood'],
  "rugby": ['blue-seats','club-at-night','industrial','olympic','skylights'],
  //"rugby": ['skylights'],
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
    this.updateImageClass();
  },
  
  newBackgrounds( group ){
    this.set('imagesGroup',group);
    this.updateImageClass();
  },
  
  removeBackground(){
    if(!Ember.isEmpty(this.get('imageURL'))){
      this.set('imageURL',false);
    }
    if(!Ember.isEmpty(this.get('imagesGroup'))){
      this.set('imagesGroup',false);
    }
    this.updateImageClass();
  },
  
  defaultColor: Ember.computed( function(){
    return Ember.Blackout.getCSSValue('background-color','bg-dark');
  }),
  
  updateImageClass(){
    if( this.get('imageURL') ){
      
      // image should be a URL
      var url = Ember.Blackout.assertURL(this.get('imageURL'));
      
      // Get a unique className
      var className = 'page-header-' + url.hashCode();
      
      // Create a fresh css pseudo rule
      Ember.Blackout.addCSSRule( '.' + className + ':before', 'background-image: url('+url+') !important;');
      
      this.set('imageClass',this.get('baseClasses').join(' ') + ' ' + className);
      
    } else if( this.get('imagesGroup') ){
      
      let key = this.get('imagesGroup');
      
      if( imagesList[key] ){
        
        let session = this.get('session');
        let images = imagesList[key];
        
        let route = this.get('route');
        if(!route){
          route = key;
        }
        
        // Check if we've been here
        let sessionKey = route+'-header-image';
        let imageClass = session.get(sessionKey);
        
        if(!imageClass){
          
          let available = images.length;
          let image = images[Ember.Blackout.rand(1,available)-1];
          
          imageClass = key + '-' + image;
          session.set(sessionKey,imageClass);
          
        }
        
        this.set('imageClass',this.get('baseClasses').join(' ') + ' ' + imageClass);
        //this.$().addClass(imageClass);
        
      }
      
    }
    
  },

});
