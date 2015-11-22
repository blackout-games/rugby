import Ember from 'ember';
import config from '../config/environment';
const { $ } = Ember;
import moment from 'moment';

export default Ember.Service.extend({
  locals: Ember.inject.service(),
  i18n: Ember.inject.service(),
  EventBus: Ember.inject.service(),
  moment: Ember.inject.service(),
  
  supportedLocales: {
    
    /**
     * For testing, causes all translated items to be 'CT' to easily find untranslated stuff
     */
    'test': { label: 'Test', fb: 'en_GB', jquery: 'en-GB' },
    
    /**
     * Should mimic locales table in database
     * 
     * Also change in:
     *   environment.js -> ENV.moment
     */
    'en-gb': { label: 'English', fb: 'en_GB', jquery: 'en-GB' },
    'fr': { label: 'Français', fb: 'fr_FR', jquery: 'fr' },
    'it': { label: 'Italiano', fb: 'it_IT', jquery: 'it' },
    'es': { label: 'Español', fb: 'es_ES', jquery: 'es' },
    'af': { label: 'Afrikaans', fb: 'af_ZA', jquery: 'af' },
    'es-ar': { label: 'Español Argentina', fb: 'es_ES', jquery: 'es' },
    'ru': { label: 'Русский', fb: 'ru_RU', jquery: 'ru' },
    
    default: 'en',
    
  },
  
  currentLocale: null,
  
  getCurrent(){
    return this.get('currentLocale');
  },
  
  getLocale(){
    return this.get('supportedLocales.'+this.get('currentLocale'));
  },
  
  /**
   * Language should be a localisation string, e.g. 'en-gb', or 'fr-fr'
   */
  
  initLocale(){
    
    let locale = this.get('locals').read('locale');
    
    // Set default if not set
    if(Ember.isEmpty(locale)){
      
      let supportedLocales = this.get('supportedLocales');
      
      if(window.blackout.languageHeader){
        
        window.blackout.languageHeader = 'fa-US,fn;q=0.8,cl-FR;q=0.6';
        let header = window.blackout.languageHeader;
        
        let parts = header.split(',');
        
        parts.some(function(item){
          let localeStr = item.split(';')[0].replace('_','-').toLowerCase();
          if(supportedLocales[localeStr]){
            locale = localeStr;
            return true;
          } else {
            localeStr = localeStr.substr(0,2);
            let localeFound = false;
            let loopFunc = function(localeIndex/*,localeItem*/){
              if( localeStr === localeIndex.substr(0,2) ){
                locale = localeIndex;
                localeFound = true;
                return false;
              }
            };
            $.each(supportedLocales,loopFunc);
            if(localeFound){
              return true;
            }
          }
        });
        
      }
      
      if(Ember.isEmpty(locale)){
        locale = supportedLocales.default;
      }
      
    }
    
    /*let self = this;
    Ember.run.later(function(){
      self.change('es');
    },5000);*/
    
    //locale = 'en-gb'; // Must manually change back to english since locales are remembered
    //locale = 'it'; 
    //locale = 'test'; 
    
    return this.change(locale);
    
  },
  
  /**
   * Wrapper for i18n.addTranslation so we can manage which translations are loaded and which aren't
   * @param {json} data A JSON translation document
   */
  addTranslation( locale, data ){
    
    if( locale==='test' ){
      Ember.$.each(data,(index) => {
        data[index] = 'CT';
      });
    }
    
    /*this.get('locale').addTranslations('it',{
      'login.errors.no-username': 'si no username',
      'menu.manager.dashboard': 'si dashboard',
      'menu.hide': 'si hide',
      'clubrooms.private-conv': 'si private conv',
    });*/
    
    this.get('i18n').addTranslations(locale, data);
    this.set('supportedLocales.' + locale + '.loaded',true);
    
  },
  
  change( locale ) {
    
    if( !Ember.isEmpty( this.get('supportedLocales.'+locale) ) || locale==='test' ){
      
      // Update API requests
      this.updateAJAX(locale);
      
      // Request new translation document(s)
      let self = this;
      
      let updateLocale = (data) => {
        
        Ember.Blackout.stopLoading();
        
        if(!self.get('supportedLocales.' + locale + '.loaded')){
          self.addTranslation(locale,data);
        }
          
        // Update browser locals
        self.get('locals').put('locale',locale);
        
        // Update local variable
        self.set('currentLocale',locale);
        
        // Update moment
        let momentLocale = locale==='es-ar' ? 'es' : locale;
        //self.get('moment').changeLocale(momentLocale); // moment
        moment.locale(momentLocale); // moment
        
        // Update libraries (Do this after other self sustained libs so they can rely on it's locale property for computed properties)
        self.set('i18n.locale', locale); // ember-i18n
        
        // Update registered html snippets
        self.updateRegisteredTranslations();
        
        // Broadcast event
        self.get('EventBus').publish('localeChanged', locale);
        
      };
      
      // Has this locale been loaded yet?
      if(!self.get('supportedLocales.' + locale + '.loaded')){
          
        // i18n url
        let url = config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/i18n/general';
        
        Ember.Blackout.startLoading();
        
        return Ember.$.getJSON(url).then(updateLocale);
        
      } else {
        updateLocale();
      }
      
    } else {
      Ember.Logger.warn( 'Tried to set unknown locale: ' + locale );
    }
    
  },
  
  updateAJAX( forceLocale ) {
    
    $.ajaxSetup({
        headers: {
          'Accept-Language': (forceLocale ? forceLocale : this.get('currentLocale')),
        },
    });
    
  },
  
  
  /**
   * Store for html keys registered below
   * @type {Array}
   */
  registeredHtmlKeys: [],
  
  /**
   * Provides html containing the text for the translation key given, which will update whenever the locale changes. If the html later disappears (i.e. user goes elsewhere), this is ok. The watcher will recognise that it's gone on the next update, and stop watching.
   * 
   * This should be used when these two conditions are met:
   * 1. i18n.t() won't work due to it being a computed property
   * 2. You're supplying static html straight to rendering
   * 
   * @param  {string} key The i18n key for the translated text
   * @return {string}     Html which will house the translation, and be updated if the local changes.
   */
  htmlT(key){
    
    // Get an id
    let id = 'blackout-t-' + Ember.Blackout.generateId();
    
    // Store keys
    this.get('registeredHtmlKeys').push({ id: id, key: key });
    
    // Build and return html
    return '<span id="' + id + '">' + this.get('i18n').t(key) + '</span>';
    
  },
  
  /**
   * Called when locale changes, and updates any registered html translations. If the item no longer exists in the dom, it is removed from the store.
   * @return {[type]} [description]
   */
  updateRegisteredTranslations(){
    
    let keys = this.get('registeredHtmlKeys');
    let indexesToRemove = [];
    let self = this;
    
    $.each(keys,function(i,item){
      
      // Check for item in dom
      let $item = $('#'+item.id);
      if($item.length){
        
        // Update translation
        $item.html(self.get('i18n').t(item.key).toString());
        
      } else {
        
        // Mark for removal
        indexesToRemove.push(i);
        
      }
      
    });
    
    if(!Ember.isEmpty(indexesToRemove)){
      
      // Remove old keys
      for(let i=indexesToRemove.length-1; i>=0; i--){
        this.get('registeredHtmlKeys').splice(i,1);
      }
      
    }
    
  },
  
});
