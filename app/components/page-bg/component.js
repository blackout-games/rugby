import Ember from 'ember';

var imagesList = {
  "dash": ['boss','design','design2','desks','glass','green','hq','office'],
  //"dash": ['green'],
  "rugby": ['blue-seats','club-at-night','industrial','olympic','skylights'],
  //"rugby": ['skylights'],
  //"squad": ['green2','green3','lockers','training'],
  "squad": ['training'], // Leave this bg, since it's the best. Fow now.
  "not-found": ['ball'],
  "grounds": ['dark'], //,'club' (lacking),'lights' (nope),'stadium' (good but save for maybe stadium route?),'water' (great, but save for elsewhere)
  //"grounds": ['water'],
};

export default Ember.Component.extend({
  baseClasses: ['page-header-bg vf-child'],
  attributeBindings: ['id'],
  id: 'page-bg',
  
  /**
   * Set to remove image
   * @type {Boolean}
   */
  disableImage: false,
  
  /*// UI Events
  uiEvents: [
    {
      eventName: 'resize',
      callbackName: 'updateMode',
      selector: window,
    }
  ],*/
  
  startListening: Ember.on('init',function(){
    
    this.get('eventBus').subscribe('setNewBackground', this, this.newBackground);
    this.get('eventBus').subscribe('setNewBackgrounds', this, this.newBackgrounds);
    this.get('eventBus').subscribe('removeBackground', this, this.removeBackground);
    
  }),
  
  stopListening: Ember.on('willDestroyElement',function(){
    
    this.get('eventBus').unsubscribe('setNewBackground', this, this.newBackground);
    this.get('eventBus').unsubscribe('setNewBackgrounds', this, this.newBackgrounds);
    this.get('eventBus').unsubscribe('removeBackground', this, this.removeBackground);
    
  }),
  
  newBackground( url, mobileHigher ){
    this.set('imageURL',url);
    this.updateImageClass();
    this.updateHeight(mobileHigher);
    
    Ember.run.next(()=>{
      //this.updateMode();
    });
  },
  
  newBackgrounds( group, mobileHigher ){
    this.set('imagesGroup',group);
    this.updateImageClass();
    this.updateHeight(mobileHigher);
    
    Ember.run.next(()=>{
      //this.updateMode();
    });
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
    return Ember.Blackout.getCSSColor('bg-dark');
  }),
  
  updateImageClass(){
    if( this.get('imageURL') ){
      
      // image should be a URL
      var url = Ember.Blackout.assertURL(this.get('imageURL'));
      
      // Get a unique className
      var className = 'page-header-' + url.hashCode();
      
      // Create a fresh css pseudo rule
      Ember.Blackout.addCSSRule( '.' + className + ':before', 'background-image: url('+url+') !important;');
      
      this.set('bgImageClass',className);
      this.set('disableImage',false);
      
    } else if( this.get('imagesGroup') ){
      
      let key = this.get('imagesGroup');
      
      if( imagesList[key] ){
        
        let images = imagesList[key];
        
        let route = this.get('route');
        if(!route){
          route = key;
        }
        
        // Check if we've been here
        let sessionKey = route+'-header-image';
        let imageClass = this.get('cache.'+sessionKey);
        
        if(!imageClass){
          
          let available = images.length;
          let image = images[Ember.Blackout.rand(1,available)-1];
          
          imageClass = key + '-' + image;
          this.set('cache.'+sessionKey,imageClass);
          
        }
        
        this.set('bgImageClass',imageClass);
        this.set('disableImage',false);
        //this.$().addClass(imageClass);
        
      }
      
    } else {
      
      // Must wrap with afterRender to avoid deprecation warnings about double modification in single render [deprecation id: ember-views.render-double-modify]
      Ember.run.scheduleOnce('afterRender', this, ()=>{
        this.set('disableImage',true);
      });
    }
    
  },
  
  imageClass: Ember.computed('bgImageClass','disableImage',function(){
    if(!this.get('disableImage')){
      return this.get('baseClasses').join(' ') + ' ' + this.get('bgImageClass');
    } else {
      return '';
    }
  }),
  
  updateHeight(mobileHigher){
    
    if(mobileHigher){
      this.$('.page-bg-height').addClass('higher');
    } else {
      this.$('.page-bg-height').removeClass('higher');
    }
    
  },
  
  extraClass: '',
  
  /**
   * Turned this off due to too much headache around resizing, and showing/hiding main menu. Plus it actually just looks better with a full background when on desktop, rather than dark sides and bottom.
   */
  updateMode(){
    
    // Get visible gap between page container and body
    let $navBody = Ember.$('#nav-body');
    let $container = $navBody.findClosest('div[class^="page-container-"],div[class*=" page-container-"]');
    let $el = this.$('.page-bg-height');
    
    if($container.length){
      
      let gap = $navBody.width() - $container.width();
      let threshold = 50;
      
      if(gap<threshold && !$el.hasClass('page-bg-header-mode')){
        
        $el.addClass('page-bg-header-mode');
        this.$().addClass('page-bg-header-mode');
        this.set('extraClass',' page-bg-header-mode');
        
      } else if(gap>=threshold && $el.hasClass('page-bg-header-mode')){
        
        $el.removeClass('page-bg-header-mode');
        this.$().removeClass('page-bg-header-mode');
        this.set('extraClass','');
        
      }
      
    } else {
    
      $el.removeClass('page-bg-header-mode');
      this.$().removeClass('page-bg-header-mode');
      this.set('extraClass','');
      
    }
    
  },

});
