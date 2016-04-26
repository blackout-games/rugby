import Ember from 'ember';
import t from "rugby-ember/utils/translation-macro";

export default Ember.Component.extend({
  userImages: Ember.inject.service(),
  preferences: Ember.inject.service(),
  user: Ember.inject.service(),
  tagName: 'span',
  
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
   * Only needs to be set if not using a special mode such as manager or club
   */
  imageUrl: '',
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$('.user-image').addClass( this.get('type') + '-avatar' + (this.get('inline')?'-inline':'') );
    let imageUrl = '';
    
    // Check for special cases
    if(this.get('type')==='manager'){
      
      imageUrl = this.get('userImages').registerManagerImage(this.$('.user-image'),this.get('defaultColor'),this.isLargeSize(this.get('size')),this.get('manager'));
      
    } else if(this.get('type')==='club'){
      
      imageUrl = this.get('userImages').registerClubImage(this.$('.user-image'),this.get('defaultColor'),this.isLargeSize(this.get('size')),this.get('club'));
      
    } else {
      
      // TODO: support custom images
      this.get('userImages').registerImage(this.$('.user-image'),this.get('defaultColor'), this.get('type'));
      
    }
    
    // Save image URL
    this.set('imageUrl',imageUrl);
    
    // Move classes
    let classes = this.$()[0].className.split(/\s+/);
    Ember.$.each(classes,(i,className)=>{
      if(className!=='ember-view'){
        this.$('.user-image').addClass(className);
        this.$().removeClass(className);
      }
    });
    
    // Add size
    if(this.get('size')){
      this.$('.user-image').addClass('user-image-'+this.get('size'));
    }
    
  }),
  
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
  editorModel: Ember.computed('model',function(){
    
    let model = this.get('model');
    
    model.set('customUrl',this.get('imageUrl'));
    
    if( this.get('type') === 'manager' ){
      model.set('imageType',this.get('managerImageType'));
      model.set('customUrl',this.get('managerCustomUrl'));
    }
    
    if(!model.rollbackAttributes){
      let originalImageType = this.get('managerImageType');
      let originalCustomUrl = this.get('managerCustomUrl');
      
      model.rollbackAttributes = ()=>{
        model.set('imageType',originalImageType);
        model.set('customUrl',originalCustomUrl);
        this.send('onChangedImageType',originalImageType);
      };
    }
    
    return model;
    
  }),
  
  editorForm: Ember.computed(function(){
    
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
      label: t('user-image-editor.custom-url'),
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
            
          },(error)=>{
            fail(error);
          });
          
        }
      }
      
      let url = this.get('model.customUrl');
      let minSize = 200;
      
      // Version the image so that if the user changes the image at the source, it will refresh from the cache
      let version = Ember.Blackout.getTimeHex();
      let separator = Ember.Blackout.getSeparator(url);
      
      if(url.regexIndexOf(/[&?]v=/i)>=0){
        url = url.replace(/v=\w+/i,'v=' + version);
      } else {
        url += separator + 'v=' + version;
      }
      
      // Load image
      Ember.Blackout.preloadImage(url).then((size)=>{
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
            
          },(error)=>{
            fail(error);
          }).finally(final);
          
        },(error)=>{
          fail(error);
        });
        
        
      },()=>{
        fail(Ember.Blackout.error({
          item: 'customUrl',
          title: t('user-image-editor.errors.image-not-found'),
        }));
      });
      
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
  
});
