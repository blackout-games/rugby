import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  userImages: Ember.inject.service(),
  preferences: Ember.inject.service(),
  user: Ember.inject.service(),
  tagName: 'span',
  classNames: ['iblock'],
  
  /**
   * e.g. manager, club, or empty for custom
   */
  type: null,
  
  /**
   * e.g. dark, light
   */
  defaultColor: 'light',
  
  /**
   * Size
   */
  size: 'medium', // small | medium | large | huge | gigantic
  
  /**
   * The image URL
   * This is only required for custom images when type is not specified
   */
  url: null,
  
  /**
   * The placeholder image URL
   * This is set automatically for special types (managers, clubs)
   * But you can override here
   */
  placeholderUrl: null,
  
  imageWrapperClasses: ['user-image'],
  imageClasses: ['user-image-direct'],
  
  onInit: Ember.on('init',function(){
    
    /**
     * Not sure why ember doesn't reset component properties sometimes.
     */
    this.set('imageWrapperClasses',['user-image']);
    this.resetMe();
    
  }),
  
  resetMe(){
    this.set('model',Ember.Object.create());
  },
  
  addImageClass(className){
    let imageWrapperClasses = this.get('imageWrapperClasses');
    imageWrapperClasses.pushObject(className);
    imageWrapperClasses = imageWrapperClasses.uniq();
    this.set('imageWrapperClasses',imageWrapperClasses);
  },
  
  onReceive: Ember.on('didReceiveAttrs',function(attrs){
    
    if(this.attrChanged(attrs,'type')){
      
      let imageUrl;
      let updateImage = Ember.run.bind(this,this.updateImage);
      
      // Check for special cases
      if(this.get('type')==='manager'){
        
        if(this.get('isCurrentUserImage')){
          
          imageUrl = this.get('userImages').registerManagerImage(updateImage,this.get('defaultColor'),this.isLargeSize(this.get('size')));
          
        } else {
          
          imageUrl = this.updateManagerImage(this.get('manager'));
          
        }
        
      } else if(this.get('type')==='club'){
        
        if(this.get('isCurrentUserImage')){
          
          imageUrl = this.get('userImages').registerClubImage(updateImage,this.get('defaultColor'),this.isLargeSize(this.get('size')));
          
        } else {
          
          imageUrl = this.updateClubImage(this.get('club'));
          
        }
        
      }
      
      // Save image URL for use with editor
      this.set('modelImageUrl',imageUrl);
      
    }
    
    if(!this.get('type') && this.attrChanged(attrs,'url')){
      
      this.resetMe();
      this.updateCustomImage(this.get('url'));
      
      // Save image URL for use with editor
      this.set('modelImageUrl',this.get('url'));
      
    }
    
    if(!this.get('type') || this.get('type')==='custom'){
      this.setCustomDefaults();
    }
    
  }),
  
  setup: Ember.on('didInsertElement',function(){
    
    Ember.run.scheduleOnce('afterRender', this, ()=>{
      
      if(this.get('incomingWrapperClass')){
        this.get('incomingWrapperClass').split(' ').forEach(className=>{
          this.addImageClass(className);
        });
      }
      
      this.addImageClass(this.get('type') + '-avatar' + (this.get('inline')?'-inline':''));
      
      if(!this.get('editable')){
          
        // Move classes
        let classes = this.$()[0].className.split(/\s+/);
        Ember.$.each(classes,(i,className)=>{
          if(className!=='ember-view'){
            this.addImageClass(className);
            this.$().removeClass(className);
          }
        });
        
      }
      
      // Add size
      if(this.get('size')){
        this.addImageClass('user-image-'+this.get('size'));
      }
      
    });
    
  }),
  
  onUpdate: Ember.on('didUpdateAttrs',function(attrs){
    if(this.get('type')==='club' && this.attrChanged(attrs,'club')){
      
      this.updateClubImage(this.get('club'));
      
    }
    if(this.get('type')==='manager' && this.attrChanged(attrs,'manager')){
      
      this.updateManagerImage(this.get('manager'));
      
    }
  }),
  
  updateClubImage(club){
    let opts = {
      club: club,
      large: this.isLargeSize(this.get('size')),
      defaultBgColor: this.get('defaultColor'),
      bgColor: this.get('defaultColor'),
    };
    opts.url = this.get('userImages').getClubUrl(opts);
    this.updateImage(opts);
    return opts.url;
  },
  
  updateManagerImage(manager){
    let opts = {
      manager: manager,
      large: this.isLargeSize(this.get('size')),
      defaultBgColor: this.get('defaultColor'),
      bgColor: this.get('defaultColor'),
    };
    opts.url = this.get('userImages').getManagerUrl(opts);
    if(this.get('debug')){
      print('opts',opts);
    }
    this.updateImage(opts);
    return opts.url;
  },
  
  updateCustomImage(url){
    
    let userImages = this.get('userImages');
    let imageUrl = userImages.getCacheUrl(url,200);
    
    this.set('imageUrl',imageUrl);
    
    return imageUrl;
    
  },
  
  setCustomDefaults(){
    
    let userImages = this.get('userImages');
    this.set('defaultBgColor',userImages.getDefaultColor(this.get('defaultColor')));
    if(this.get('defaultColor')==='dark'){
      this.set('notFoundUrl','/assets/images/user/no-image.png');
    } else {
      this.set('notFoundUrl','/assets/images/user/no-image-light.png');
    }
    
  },
  
  isLargeSize(size){
    return size==='large'
      || size==='huge'
      || size==='gigantic';
  },
  
  managerImageType: Ember.computed('session.data.manager.imageUrl',function(){
    let managerImageType = this.get('preferences').getPref('managerImageType');
    
    if(!Ember.isEmpty(managerImageType)){
      return managerImageType;
    } else {
      let facebookUrl = this.get('session.data.manager.facebookImageUrl');
      let gravatarImageUrl = this.get('session.data.manager.gravatarImageUrl');
      let imageUrl = this.get('session.data.manager.imageUrl');
      if(imageUrl===facebookUrl){
        return 'fb';
      } else if(imageUrl===gravatarImageUrl){
        return 'gavatar';
      } else {
        return 'custom';
      }
    }
  }),
  
  managerCustomUrl: Ember.computed('prefs',function(){
    
    let url = this.get('preferences').getPref('managerCustomImageUrl');
    if(url){
      url = url.replace(/[?&]v=\w+/i,'');
    }
    return url;
    
  }),
  
  managerCustomUrlFull: Ember.computed('prefs',function(){
    
    return this.get('preferences').getPref('managerCustomImageUrl');
    
  }),
  
  /**
   * The following model values/functions are for when we're using a custom model, rather than a real one from ember data.
   */
  
  // Base object
  model: Ember.Object.create(),
  
  // Call this when we save/commit new values
  updateSavedModel(){
    this.get('model').rollbackAttributes = null;
    this.notifyPropertyChange('model');
  },
  
  // Computed property to build the model for consumption
  editorModel: Ember.computed('modelImageUrl',function(){
    
    let model = this.get('model');
    
    model.set('customUrl',this.get('modelImageUrl'));
    
    if( this.get('type') === 'manager' ){
      model.set('imageType',this.get('managerImageType'));
      model.set('customUrl',this.get('managerCustomUrl'));
    }
    
    if(!model.rollbackAttributes){
      
      let originalImageType = 'custom';
      let originalCustomUrl = this.get('modelImageUrl');
      
      if( this.get('type') === 'manager' ){
        originalImageType = this.get('managerImageType');
        originalCustomUrl = this.get('managerCustomUrl');
      } else if( this.get('type') === 'club' ){
        log('Attempted to create rollbackAttributes for club user-image. (component:user-image)');
      }
      
      model.rollbackAttributes = ()=>{
        model.set('imageType',originalImageType);
        model.set('customUrl',originalCustomUrl);
        this.send('onChangedImageType',originalImageType);
      };
      
    }
    
    //this.set('model',model);
    
    return model;
    
  }),
  
  editorForm: Ember.computed('model',function(){
    
    let editorForm = [];
    
    if( this.get('type') === 'manager' ){
      
      let imageTypeOptions = [];
      
      if(!Ember.isEmpty(this.get('session.data.manager.facebookImageUrl'))){
        imageTypeOptions.push({
          value: 'fb',
          label: t('buttons.facebook'),
        });
      }
      
      imageTypeOptions.push({
        value: 'gravatar',
        label: t('user-image-editor.gravatar'),
      });
      
      imageTypeOptions.push({
        value: 'custom',
        label: t('user-image-editor.custom'),
      });
      
      editorForm.push({
        id: 'managerImageType',
        type: 'radio',
        label: t('user-image-editor.image-type'),
        valuePath: 'imageType',
        options: imageTypeOptions,
        onChanged: Ember.run.bind(this,this.actions.onChangedImageType),
      });
      
    }
    
    let customUrlTextBox = {
      id: 'customUrl',
      label: t('user-image-editor.image-url'),
      valuePath: 'customUrl',
      onChanged: Ember.run.bind(this,this.actions.onChangedCustomUrl),
      placeholder: 'http://',
      //helper: t('user-image-editor.custom-url-helper'),
    };
    
    if(this.get('type') === 'manager'){
      customUrlTextBox.visibleOnKey = 'imageType';
      customUrlTextBox.visibleOnKeyValue = 'custom';
    }
    
    editorForm.push(customUrlTextBox);
    
    if(this.get('showAvatarLinks')){
      
      let i18n = this.get('i18n');
      
      editorForm.push({
        id: 'avatarLinksLink',
        label: t('misc.helpful-links'),
        type: 'link',
      });
      
      let makeLinks = (links)=>{
        let html = '';
        links.forEach(link=>{
          html += `
            <div class="gap-sm ellipsis">
              <i class="icon-right-open icon-lg icon-vcenter text-light"></i> <a href="${link.url}" target="_blank" class="show-i-on-hover">${link.label}</a> <i class="icon-link-ext icon-vcenter"></i>
            </div>`;
        });
        return html;
      };
      
      let links = [
        { url: 'http://avatarmaker.com/', label: 'Avatar Maker' },
        { url: 'http://doppelme.com/', label: 'DoppleMe' },
        { url: 'http://pickaface.net/', label: 'Pick a Face' },
        { url: 'http://www.icongenerators.net/pixelavatar.html', label: 'Pixel Avatar' },
        { url: 'http://www.faceyourmanga.com/editmangatar.php', label: 'Face Your Manga' },
      ];
      
      let avatarGeneratorsHtml = '<label>' + i18n.t('players.avatars.avatar-generators').toString() + '</label>';
      avatarGeneratorsHtml += makeLinks(links);
      
      let imageHosts = [
        { url: 'http://imgur.com/', label: 'imgur' },
        { url: 'https://imgsafe.org/', label: 'ImgSafe' },
      ];
      
      let imageHostsHtml = '<label>' + i18n.t('players.avatars.image-hosts').toString() + '</label>';
      imageHostsHtml += makeLinks(imageHosts);
      
      let imageProviders = [
        { url: 'https://images.google.com/', label: 'Google Images' },
        { url: 'http://www.faganfinder.com/img/', label: 'Fagan Finder' },
        { url: 'http://search.creativecommons.org/', label: 'CC Search' },
        { url: 'http://photopin.com/', label: 'Photo Pin' },
      ];
      
      let imageProvidersHtml = '<label>' + i18n.t('players.avatars.other-image-providers').toString() + '</label>';
      imageProvidersHtml += makeLinks(imageProviders);
      
      let linksHtml = `
      <div class="row row-nowrap gap-md">
        <div class="col-6 right-pad-md">${avatarGeneratorsHtml}</div>
        <div class="col-6">${imageHostsHtml}</div>
      </div>
      <div class="row row-nowrap">
        <div class="col-12">${imageProvidersHtml}</div>
      </div>`;
      
      editorForm.push({
        id: 'avatarLinks',
        type: 'content',
        showOnLinkId: 'avatarLinksLink',
        content: Ember.String.htmlSafe(linksHtml),
      });
      
    }
    
    return editorForm;
    
  }),
  
  showingEditor: false,
  
  actions: {
    showEditor(){
      this.set('showingEditor',true);
    },
    onCancel(){
      this.set('showingEditor',false);
      this.get('editorModel').rollbackAttributes();
    },
    onSave(succeed,fail,final){
      
      let model = this.get('model');
      let prefs = this.get('preferences');
      
      if( this.get('type') === 'manager' ){
        
        let imageType = model.get('imageType');
        
        if(imageType==='fb' || imageType==='gravatar'){
          
          let url;
          
          if(imageType==='fb'){
            url = this.get('session.data.manager.facebookImageUrl');
          } else if(imageType==='gravatar'){
            url = this.get('session.data.manager.gravatarImageUrl');
          }
          
          return prefs.setPrefs([
            { key:'managerImageType', value: imageType },
            { key:'managerImageUrl', value: url },
          ]).then(()=>{
            
            // Refresh manager in session
            return this.get('user').refreshSessionManager().finally(()=>{
              this.updateSavedModel();
              succeed();
            });
            
          },fail);
          
        }
      }
      
      let url = this.get('model.customUrl');
      let minSize = 200;
      
      if(url || (this.get('type') && this.get('type')!=='custom')){
        
        // Version the image so that if the user changes the image at the source, it will refresh from the cache
        let version = Ember.Blackout.getTimeHex();
        let separator = Ember.Blackout.getSeparator(url);
        
        if(url.regexIndexOf(/[&?]v=/i)>=0){
          url = url.replace(/v=\w+/i,'v=' + version);
        } else {
          url += separator + 'v=' + version;
        }
        
        // Run through cache so that we get https
        let tmpURL = this.get('userImages').getCacheUrl(url,200);
        
        // Load image
        Ember.Blackout.preloadImage(tmpURL).then((size)=>{
          let { w, h } = size;
          
          // Check size
          if(w < minSize || h < minSize){
            
            fail(Ember.Blackout.error({
              item: 'customUrl',
              title: t('user-image-editor.errors.image-too-small',{ minSize: 'minSize' }),
              minSize: minSize,
            }));
            
            return;
          }
          
          if( this.get('type') === 'manager' ){
            return this.saveManagerImage(url,succeed,fail,final);
          } else if( this.get('type') === 'club' ){
            return this.saveClubImage(url,succeed,fail,final);
          } else {
            return this.saveCustomImage(url,succeed,fail,final);
          }
          
          
        },()=>{
          fail(Ember.Blackout.error({
            item: 'customUrl',
            title: t('user-image-editor.errors.image-not-found'),
          }));
        });
        
      } else {
        
        return this.saveCustomImage(url,succeed,fail,final);
        
      }
      
    },
    onChangedImageType(value){
      if( this.get('type') === 'manager' ){
        
        let customUrl = this.get('managerCustomUrlFull');
        let newUrl;
        
        if(value==='gravatar'){
          newUrl = this.get('session.data.manager.gravatarImageUrl');
        } else if(value==='fb'){
          newUrl = this.get('session.data.manager.facebookImageUrl');
        } else if(value==='custom'&&customUrl){
          newUrl = customUrl;
        } else {
          newUrl = false;
        }
        
        if(newUrl!==false){
          this.set('session.data.manager.imageUrl',newUrl);
          this.get('userImages').updateSessionImages(value);
        }
        
      }
    },
    onChangedCustomUrl(/*value*/){
      //log('changed url',value);
    },
  },
  
  saveManagerImage(url,succeed,fail,final){
    
    let prefs = this.get('preferences');
      
    // Save image
    return prefs.setPrefs([
      { key:'managerCustomImageUrl', value: url },
      { key:'managerImageType', value: 'custom' },
      { key:'managerImageUrl', value: url },
    ]).then(()=>{
      
      // Get cache urls
      let cacheUrl = this.get('userImages').getCacheUrl(url);
      let cacheUrlLarge = this.get('userImages').getLargeUrl(cacheUrl);
      
      return Ember.Blackout.preloadImages([
        cacheUrl,
        cacheUrlLarge
      ]).then(()=>{
        
        // Refresh manager in session
        this.get('user').refreshSessionManager().finally(()=>{
          this.set('session.data.manager.imageUrl',url);
          this.notifyPropertyChange('prefs');
          this.get('userImages').updateSessionImages();
          this.updateSavedModel();
          succeed();
        });
        
      },fail).finally(final);
      
    },fail);
    
  },
  
  saveClubImage(url/*,succeed,fail,final*/){
    
    log('Attempted to save a club image. Not implemented yet. (component:user-image)',url);
    
  },
  
  saveCustomImage(url,succeed,fail,final){
    
    // Update local
    this.updateCustomImage(url);
    
    if(this.attrs.onSave && typeof this.attrs.onSave === 'function'){
      this.attrs.onSave(url,succeed,fail,final);
    } else {
      log('Tried to save a custom image, but there is no handler for the onSave action (component:user-image).');
    }
    
  },
  
  /**
   * 
   * ==== WIP
   * Changes a user image. Checks if it exists, and if not, removes background color so we see through to default "no image found" image.
   * Expects the given selector to refer to an image object where an under bg image, and a default bg image are applied (See CSS mixin .user-image)
   * 
   * 
   */
  updateImage ( opts ) {
    
    if(!this.get('isDestroyed') && !this.get('isDestroying')){
      
      if(opts.bgColor==='dark'){
        this.set('notFoundUrl','/assets/images/user/no-image.png');
      } else {
        this.set('notFoundUrl','/assets/images/user/no-image-light.png');
      }
      
      if(opts.isClub && !this.get('placeholderUrl')){
        this.set('placeholderUrl','/assets/images/user/club.png');
      }
      if(this.get('debug')){
        log('opts.defaultBgColor',opts.defaultBgColor);
      }
      this.set('defaultBgColor',opts.defaultBgColor);
      
      if(opts.url){
        
        // BREAKS DEFAULT COLOR
        //Ember.run.next(()=>{
          
          this.set('imageUrl',opts.url);
          
          // Ensure parent has z-index of more than 0
          /*$el.each(function(){
            if($(this).parent().css('z-index')==='auto'){
              $(this).parent().css('z-index',1);
            }
            if($(this).parent().css('position')==='static'){
              $(this).parent().css('position','relative');
            }
          });*/
              
        //});
      
      } else {
        
        // No URL, if this is an update from another image, we need to remove the image url
        this.set('imageUrl','');
        
      }
      
      return true;
      
    } else {
      return false;
    }
    
  },
  
});
