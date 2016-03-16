import Ember from 'ember';
const { Blackout, $ } = Ember;

/**
 * This service handles manager images and club images for the currently logged in manager, as well as general user images, like manager and club images for other managers around the game.
 * 
 * What you get here is a layered image which has the ability to show an "image not found" image if the user-image is not loading, and also a placeholder if the user has not provided an image URL.
 */

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  eventBus: Ember.inject.service(),
  preferences: Ember.inject.service(),
  
  imageStore: [],
  
  watchForNewLogins: Ember.on('init',function(){
    this.get('eventBus').subscribe('sessionBuilt',this,this.updateSessionImages);
  }),
  
  registerImage($el, url, defaultColor){
    
    if(defaultColor==='dark'){
      defaultColor = Ember.$('#nav-sidebar').css('background-color');
    } else { // light
      defaultColor = Ember.Blackout.getCSSColor('bg-light');
    }
    
    // Register for later updates
    this.get('imageStore').pushUnique({el: $el, defaultBgColor: defaultColor});
    
    // Update the image now
    this.updateImage($el, url, defaultColor);
    
  },
  
  deregisterImage($el){
    
    $.each(this.get('imageStore'),(i,img)=>{
      
      let $managerEl = img.el ? img.el : $(img.selector);
      
      if($el === $managerEl){
        this.get('imageStore').splice(i,1);
        return false;
      }
      
    });
    
  },
  
  /**
   * Register a manager image (for *currently logged in* manager)
   */
  registerManagerImage($el,defaultBgColor,largeVersion){
    
    // Get large image url
    let url = this.get('managerImageURL');
    let isGravatar = url.indexOf('gravatar.com')>=0;
    
    if(largeVersion){
      url = this.getLargeUrl(url);
      $el.data('is-large-image',true);
    }
    
    if(isGravatar){
      let separator = Ember.Blackout.getSeparator(url);
      url += separator + 'default=' + encodeURIComponent('http://dah9mm7p1hhc3.cloudfront.net/assets/images/user/manager-light-7448c6ddbacf053c2832c7e5da5f37df.png');
    }
    
    $el.data('is-manager-image',true);
    
    this.registerImage($el, url, defaultBgColor, largeVersion);
    
    return url;
    
  },
  
  /**
   * Register a club image (for *currently logged in* manager)
   */
  registerClubImage($el,defaultBgColor,largeVersion){
    
    // Get large image url
    let url = this.get('clubImageURL');
    if(largeVersion){
      url = this.getLargeUrl(url);
      $el.data('is-large-image',true);
    }
    
    $el.data('is-club-image',true);
    
    this.registerImage($el, url, defaultBgColor, largeVersion);
    
    return url;
    
  },
  
  getLargeUrl(url){
    
    let isGravatar = url.indexOf('gravatar.com')>=0;
    let separator = Ember.Blackout.getSeparator(url);
    
    if(isGravatar){
      if(url.indexOf('size=')>=0){
        url = url.replace(/size=[0-9]+/i,'size=200');
      } else {
        url += separator + 'size=200';
      }
    } else {
      let isFacebook = url.indexOf('facebook.com')>=0;
      if(isFacebook){
        url = url.replace('type=normal','type=large');
      } else {
        url = url.replace(/size=[0-9]+/i,'size=200');
      }
    }
    
    return url;
    
  },
  
  /**
   * Changes a user image. Checks if it exists, and if not, removes background color so we see through to default "no image found" image.
   * Expects the given selector to refer to an image object where an under bg image, and a default bg image are applied (See CSS mixin .user-image)
   * @param  {string}    selector JQuery selector for the club image
   * @param  {string}    imgUrl   The user's image URL
   * @param  {css color} defaultBgColor  The color for the background in the case of a user image with transparency 
   */
  updateImage ( $el, imgUrl, defaultBgColor ) {
    
    if(imgUrl){
    
      Ember.run.next(function() {
        
        // Set background as color to block out "Logo Not Found" image
        $el.css('background-color', defaultBgColor);
        
        // Set image
        Blackout.preloadImage(imgUrl).then(() => {
          $el.css('background-image', 'url(' + imgUrl + ')');
        });
        
        
        // Ensure parent has z-index of more than 0
        $el.each(function(){
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
            $el.css('background-color', 'transparent');
            
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
  updateSessionImages( forceType ){
    
    if(forceType){
      this.set('forceType',forceType);
    }
    
    // Do this next, so that other things have time to render based on a new login
    // i.e. menu avatar is still hidden at this point so won't show up when we check for it
    Ember.run.next(()=>{
      
      // ---------------------------------- Images
      
      var notFound = [];
      
      this.get('imageStore').forEach((img,index)=>{
        
        let $el = img.el ? img.el : $(img.selector);
        
        if($el.length){
          
          if($el.data('is-manager-image')){
            
            let url = this.get('managerImageURL');
            
            if($el.data('is-large-image')){
              url = this.getLargeUrl(url);
            }
            
            this.updateImage($el, url, img.defaultBgColor);
            
          } else if($el.data('is-club-image')){
            
            let url = this.get('clubImageURL');
            if($el.data('is-large-image')){
              url = this.getLargeUrl(url);
            }
            
            this.updateImage($el, url, img.defaultBgColor);
            
          }
          
        } else {
          notFound.push(index);
        }
        
      });
      
      // Remove not found
      notFound.forEach(function(i){
        this.get('imageStore').splice(i,1);
      });
      
      // Reset forceType
      if(forceType){
        this.set('forceType',null);
      }
      
    });
    
  },
  
  /**
   * Image URL for *current* logged in manager
   */
  managerImageURL: Ember.computed('session.data.manager.imageUrl','forceType', function() {
    if (this.get('session.isAuthenticated')) {
      
      let forceType = this.get('forceType');
      let imageType = forceType ? forceType : this.get('preferences').getPref('managerImageType');
      let imageUrl;
      
      if(imageType==='fb'){
        imageUrl = this.get('session.data.manager.facebookImageUrl');
      } else if(imageType==='gravatar'){
        imageUrl = this.get('session.data.manager.gravatarImageUrl');
      } else {
        imageUrl = this.get('session.data.manager.imageUrl');
      }
      
      if(imageType==='custom'){
        // Run the image through cloudfront
        imageUrl = this.getCacheUrl(imageUrl);
      }
      
      if (imageUrl) {
        return imageUrl;
      } else {
        return 'assets/images/user/manager.png';
      }
    }
  }),
  
  getCacheUrl(url){
    if(url){
      return 'https://dgx5waunvf836.cloudfront.net/img.php?src=' + encodeURIComponent(url) + '&size=100';
    } else {
      return url;
    }
  },
  
  /**
   * Generates manager html for decorate username locations
   * @param  {object} manager Manager object
   * @return {string}         Html
   */
  getManagerHTML( manager ){
    
    // Vars
    let username = manager.get('username');
    let imageClassName = 'md_manager_img_'+username.alphaNumeric();
    let managerId = manager.get('numberId') || manager.get('id');
    let url = 'https://www.blackoutrugby.com/game/me.lobby.php?id='+managerId;
    
    // Create HTML
    let html = '<span class="nowrap"><div class="manager-avatar-inline '+imageClassName+'"></div><a href="'+url+'">' + username + '</a></span>';
    
    // Get image URL
    let imageUrl = manager.get('imageUrl');
    let isGravatar = imageUrl.indexOf('gravatar.com')>=0;
    let separator = '?';
    
    if(isGravatar){
      let def = encodeURIComponent('http://dah9mm7p1hhc3.cloudfront.net/assets/images/user/manager-light-7448c6ddbacf053c2832c7e5da5f37df.png');
      def = 'retro';
      imageUrl += separator + 'default=' + def;
    }
    
    // Load image, check if available, etc.
    Ember.run.next(()=>{
      this.updateImage($('.'+imageClassName),imageUrl,'transparent');
    });
    
    return html;
    
  },

  clubImageURL: Ember.computed('session.sessionBuilt', function() {
    
    if (this.get('session.isAuthenticated') && this.get('session.data.manager.currentClub')) {

      var club = this.get('store').peekRecord('club', this.get('session.data.manager.currentClub'));

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
