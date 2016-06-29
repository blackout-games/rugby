import Ember from 'ember';
const { Blackout, $ } = Ember;

/**
 * This service handles manager images and club images for the currently logged in manager. It should only be used for images that need to change when a user logs in or out, or switches active club.
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
  
  registerImage(url, opts){
    
    // Register for later updates
    this.get('imageStore').pushUnique(opts);
    
    // Update the image now
    opts.url = url;
    
    opts.callback(opts);
    
  },
  
  /**
   * Register a manager image (for *currently logged in* manager)
   */
  registerManagerImage(callback,defaultBgColor,largeVersion,debug){
    
    let opts = {
      callback: callback,
      large: largeVersion,
      defaultBgColor: defaultBgColor,
      debug: debug,
    };
    
    let url = this.getManagerUrl(opts);
    
    this.registerImage(url, opts);
    
    return url;
    
  },
  
  /**
   * Register a club image (for *currently logged in* manager)
   */
  registerClubImage(callback,defaultBgColor,largeVersion){
    
    let opts = {
      callback: callback,
      large: largeVersion,
      defaultBgColor: defaultBgColor,
    };
    let url = this.getClubUrl(opts);
    
    this.registerImage(url, opts);
    
    return url;
    
  },
  
  processColors(opts){
    
    opts.bgColor = opts.defaultBgColor;
    opts.defaultBgColor = this.getDefaultColor(opts.defaultBgColor);
    
  },
  
  getDefaultColor(color){
    if(color==='dark'){
      return Ember.Blackout.getCSSColor('bg-dark');
    } else { // light
      return Ember.Blackout.getCSSColor('bg-light');
    }
  },
  
  /**
   * Gets a manager url for a given manager
   * ... as opposed to the manager that is logged in
   * ... see managerImageUrl property
   */
  getManagerUrl(opts){
    
    // Get large image url
    let url;
    if(opts.manager){
      url = opts.manager.get('imageUrl');
      url = this.processManagerUrl(url);
    } else {
      url = this.get('managerImageURL');
    }
    
    if(opts.large){
      url = this.getLargeUrl(url);
    }
    
    opts.isManager = true;
    
    this.processColors(opts);
    
    return url;
    
  },
  
  getClubUrl(opts){
    
    // Get large image url
    let url;
    if(opts.club){
      url = opts.club.get('logo');
    } else {
      url = this.get('clubImageURL');
    }
    
    if(opts.large){
      url = this.getLargeUrl(url);
    }
    
    opts.isClub = true;
    
    this.processColors(opts);
    
    return url;
    
  },
  
  getSmallUrl(url){
    
    /**
     * Supports gravatar and facebook URLs
     * For giving a size to cloudfront, see getCacheUrl
     */
    
    if(!url){
      Ember.Logger.warn('URL was empty in user-images.js:getSmallUrl()');
      return;
    }
    
    let isGravatar = url.indexOf('gravatar.com')>=0;
    let separator = Ember.Blackout.getSeparator(url);
    
    if(isGravatar){
      if(url.indexOf('size=')>=0){
        url = url.replace(/size=[0-9]+/i,'size=70');
      } else {
        url += separator + 'size=70';
      }
    } else {
      let isFacebook = url.indexOf('facebook.com')>=0;
      if(isFacebook){
        //url = url.replace('type=normal','type=large');
      } else {
        url = url.replace(/size=[0-9]+/i,'size=70');
      }
    }
    
    return url;
    
  },
  
  getLargeUrl(url){
    
    /**
     * Supports gravatar and facebook URLs
     * For giving a size to cloudfront, see getCacheUrl
     */
    
    if(!url){
      Ember.Logger.warn('URL was empty in user-images.js:getLargeUrl()');
      return;
    }
    
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
      
      this.get('imageStore').forEach((opts,index)=>{
        
        let url;
        
        if(opts.isManager){
          
          url = this.get('managerImageURL');
          
        } else if(opts.isClub){
          
          url = this.get('clubImageURL');
          
        }
        
        if(opts.large){
          url = this.getLargeUrl(url);
        }
        
        opts.url = url;
        
        let success = opts.callback(opts);
          
        if(!success){
          notFound.push(index);
        }
        
      });
      
      // Remove not found
      notFound.forEach((i)=>{
        this.get('imageStore').splice(i,1);
      });
      
      // Reset forceType
      if(forceType){
        this.set('forceType',null);
      }
      
    });
    
  },
  
  processManagerUrl(url,imageType='custom'){
    if(!url){
      Ember.Logger.warn('URL was empty in user-images.js:processManagerUrl()');
      return;
    }
    
    let isGravatar = url.indexOf('gravatar.com')>=0;
    
    if(isGravatar){
      let def = 'retro';
      let separator = '?';
      url += separator + 'default=' + def;
    }
    
    if(imageType==='custom'){
      // Run the image through cloudfront
      url = this.getCacheUrl(url);
    }
    
    return url;
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
        imageUrl = this.get('preferences').getPref('managerCustomImageUrl');
        if(!imageUrl){
          imageUrl = this.get('session.data.manager.facebookImageUrl');
          if(!imageUrl){
            imageUrl = this.get('session.data.manager.gravatarImageUrl');
          }
        }
      }
      
      imageUrl = this.processManagerUrl(imageUrl,imageType);
      
      if (imageUrl) {
        return imageUrl;
      } else {
        return null;
      }
    }
  }),

  clubImageURL: Ember.computed('session.currentClub', function() {
    
    if (this.get('session.isAuthenticated') && this.get('session.currentClub')) {

      var club = this.get('session.currentClub');

      if (club) {
        var logo = club.get('logo');
        if (logo) {
          return this.getCacheUrl(logo);
        }
      }
      return null;

    }

  }),
  
  getCacheUrl(url,maxSize=100){
    if(url && url.indexOf('dgx5waunvf836.cloudfront.net')<0){
      return 'https://dgx5waunvf836.cloudfront.net/img.php?src=' + encodeURIComponent(url) + '&size=' + maxSize;
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
    let html = '<a href="'+url+'" class="no-hover"><span class="nowrap"><div class="manager-avatar-inline no-hover '+imageClassName+'"></div><span class="restore-hover">' + username + '</span></span></a>';
    
    // Get image URL
    let imageUrl = manager.get('imageUrl');
    let isGravatar = imageUrl.indexOf('gravatar.com')>=0;
    let separator = '?';
    
    if(isGravatar){
      //let def = encodeURIComponent('http://dah9mm7p1hhc3.cloudfront.net/assets/images/user/manager-light-7448c6ddbacf053c2832c7e5da5f37df.png');
      let def = 'retro';
      imageUrl += separator + 'default=' + def;
    }
    
    // Run the image through cloudfront
    imageUrl = this.getCacheUrl(imageUrl,70);
    
    // Load image, check if available, etc.
    Ember.run.next(()=>{
      this.updateImageDirect($('.'+imageClassName),imageUrl,'transparent');
    });
    
    return html;
    
  },
  
  /**
   * Generates club html for decorate team name locations
   * @param  {object} club Club object
   * @return {string}         Html
   * 
   * NOT CURRENTLY USED
   */
  getClubHTML( club ){
    
    // Vars
    let name = club.get('name');
    let imageClassName = 'md_club_img_'+name.alphaNumeric();
    let clubId = club.get('clubId') || club.get('id');
    let url = 'https://www.blackoutrugby.com/game/club.lobby.php?id='+clubId;
    
    // Create HTML
    let html = '<a href="'+url+'" class="no-hover"><span class="nowrap"><div class="club-avatar-inline no-hover '+imageClassName+'"></div><span class="restore-hover">' + name + '</span></span></a>';
    
    // Get image URL
    let imageUrl = club.get('logo');
    
    // Run the image through cloudfront
    imageUrl = this.getCacheUrl(imageUrl,70);
    
    // Load image, check if available, etc.
    Ember.run.next(()=>{
      this.updateImageDirect($('.'+imageClassName),imageUrl,'transparent');
    });
    
    return html;
    
  },
  
  /**
   * Generates national club html for decorate team name locations
   * @param  {object} club Club object
   * @return {string}         Html
   */
  getNationalClubHTML( club, type='nat' ){
    
    // Vars
    let name = club.get('name');
    let imageClassName = 'md_'+type+'club_img_'+name.alphaNumeric();
    //let clubId = club.get('clubId') || club.get('id');
    let clubCountry = club.get('country.id');
    let clubType = type==='nat' ? '1' : '2';
    let url = 'https://www.blackoutrugby.com/game/global.national.php?iso='+clubCountry+'&type='+clubType;
    
    // Create HTML
    let html = '<a href="'+url+'" class="no-hover"><span class="nowrap"><div class="club-avatar-inline no-hover '+imageClassName+'"></div><span class="restore-hover">' + name + '</span></span></a>';
    
    // Get image URL
    let imageUrl = club.get('logo');
    
    // Run the image through cloudfront
    imageUrl = this.getCacheUrl(imageUrl,70);
    
    // Load image, check if available, etc.
    Ember.run.next(()=>{
      this.updateImageDirect($('.'+imageClassName),imageUrl,'transparent');
    });
    
    return html;
    
  },
  
  /**
   * Changes a user image. Checks if it exists, and if not, removes background color so we see through to default "no image found" image.
   * Expects the given selector to refer to an image object where an under bg image, and a default bg image are applied (See CSS mixin .user-image)
   * @param  {string}    selector JQuery selector for the club image
   * @param  {string}    imgUrl   The user's image URL
   * @param  {css color} defaultBgColor  The color for the background in the case of a user image with transparency 
   * 
   * TODO, support fade in.
   * TODO, make img, rather than background-image
   */
  updateImageDirect ( $el, imgUrl, defaultBgColor ) {
    
    if(imgUrl){
      
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
    
    } else {
      
      // No URL, if this is an update from another image, we need to remove the image url and reset background
      
      // Set background as color to block out "Logo Not Found" image
      $el.css('background-color', defaultBgColor);
      $el.css('background-image', '');
      
    }
    
  },
  
});
