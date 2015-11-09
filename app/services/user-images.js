import Ember from 'ember';
var $ = Ember.$;

/**
 * This service handles manager images and club images for the currently logged in manager, as well as general user images, like manager and club images for other managers around the game.
 * 
 * What you get here is a layered image which has the ability to show an "image not found" image if the user-image is not loading, and also a placeholder if the user has not provided an image URL.
 */

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  EventBus: Ember.inject.service('event-bus'),
  
  managerImages: [],
  clubImages: [],
  
  watchForNewLogins: Ember.on('init',function(){
    this.get('EventBus').subscribe('sessionBuilt',this,this.updateSessionImages);
  }),
  
  /**
   * Register a manager image (for *currently logged in* manager)
   */
  registerManagerImage(selector,defaultBgColor){
    
    // Register for later updates
    this.get('managerImages').pushUnique({selector: selector, defaultBgColor: defaultBgColor});
    
    // Update the image now
    this.updateImage(selector, this.get('managerImageURL'), defaultBgColor);
    
  },
  
  /**
   * Register a club image (for *currently logged in* manager)
   */
  registerClubImage(selector,defaultBgColor){
    
    // Register for later updates
    this.get('clubImages').pushUnique({selector: selector, defaultBgColor: defaultBgColor});
    
    // Update the image now
    this.updateImage(selector, this.get('clubImageURL'), defaultBgColor);
    
  },
  
  /**
   * Changes a user image. Checks if it exists, and if not, removes background color so we see through to default "no image found" image.
   * Expects the given selector to refer to an image object where an under bg image, and a default bg image are applied (See CSS mixin .user-image)
   * @param  {string}    selector JQuery selector for the club image
   * @param  {string}    imgUrl   The user's image URL
   * @param  {css color} defaultBgColor  The color for the background in the case of a user image with transparency 
   */
  updateImage ( selector, imgUrl, defaultBgColor ) {
    
    var self = this;
    if(imgUrl){
    
      Ember.run.next(function() {
        
        // Set background as color to block out "Logo Not Found" image
        $(selector).css('background-color', defaultBgColor);
        
        // Set image
        $(selector).css('background-image', 'url(' + imgUrl + ')');
        
        // Ensure parent has z-index of more than 0
        $(selector).each(function(){
          if($(this).parent().css('z-index')==='auto'){
            $(this).parent().css('z-index',1);
          }
          if($(this).parent().css('position')==='static'){
            $(this).parent().css('position','relative');
          }
        });
        
        // Test image availability
        var tmpImg = Ember.$("<img/>")
          .on('load', function() {
            // Remove temp image
            tmpImg.remove();
          })
          .on('error', function() {
            console.log("error loading image");
            
            // Change background color back to transparent, so we can see "Logo not found"
            $(selector).css('background-color', 'transparent');
            
            // Remove temp image
            tmpImg.remove();
          })
          .attr("src", imgUrl);
          
            
      });
    
    }
    
  },
  
  /**
   * This is called if a new manager logs in
   */
  updateSessionImages(){
    
    var self = this;
    
    // Do this next, so that other things have time to render based on a new login
    // i.e. menu avatar is still hidden at this point so won't show up when we check for it
    Ember.run.next(function(){
      
      // ---------------------------------- Manager Images
      
      var notFound = [];
      
      self.get('managerImages').forEach(function(img,index){
        
        if($(img.selector).length){
          self.updateImage(img.selector, self.get('managerImageURL'), img.defaultBgColor);
        } else {
          notFound.push(index);
        }
        
      });
      
      // Remove not found
      notFound.forEach(function(i){
        self.get('managerImages').splice(i,1);
      });
      
      // ---------------------------------- Club Images
      
      notFound = [];
      
      self.get('clubImages').forEach(function(img,index){
        
        if($(img.selector).length){
          self.updateImage(img.selector, self.get('clubImageURL'), img.defaultBgColor);
        } else {
          notFound.push(index);
        }
        
      });
      
      // Remove not found
      notFound.forEach(function(i){
        self.get('clubImages').splice(i,1);
      });
      
    });
    
  },

  managerImageURL: Ember.computed('session.manager', function() {
    if (this.get('session.isAuthenticated')) {
      let imageUrl = this.get('session.manager.imageUrl');
      if (imageUrl) {
        return imageUrl;
      } else {
        return 'assets/images/user/manager.png';
      }
    }
  }),

  clubImageURL: Ember.computed('session.sessionBuilt', function() {

    if (this.get('session.isAuthenticated') && this.get('session.manager.currentClub')) {

      var club = this.get('store').peekRecord('club', this.get('session.manager.currentClub'));

      if (club) {
        var logo = club.get('logo');
        if (logo) {
          return logo;
        } else {
          return 'assets/images/user/club.png';
        }
      } else {
        return 'assets/images/user/club.png';
      }
      //*
      return 'assets/images/user/club.png';

    }

  }),
  
});
