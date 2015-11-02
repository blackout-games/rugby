import Ember from 'ember';
var $ = Ember.$;

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  
  /**
   * Changes a user image. Checks if it exists, and if not, removes background color so we see through to default "no image found" image.
   * Expects the given selector to refer to an image object where an under bg image, and a default bg image are applied (See CSS mixin .user-image)
   * @param  {string}    selector JQuery selector for the club image
   * @param  {string}    imgUrl   The user's image URL
   * @param  {css color} bgColor  The color for the background in the case of a user image with transparency 
   */
  updateImage ( selector, imgUrl, bgColor ) {
    
    var self = this;
    if(imgUrl){
    
      Ember.run.next(function() {
        
        // Set background as color to block out "Logo Not Found" image
        $(selector).css('background-color', bgColor);
        
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

  updateManagerImage: function( defaultBgColor, imageUrl=null ) {
    this.updateImage('.manager-avatar-menu',(imageUrl?imageUrl:this.get('managerImageURL')),defaultBgColor);
  },

  updateClubImage: function( defaultBgColor ) {
    this.updateImage('.club-avatar-menu',this.get('clubImageURL'),defaultBgColor);
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
