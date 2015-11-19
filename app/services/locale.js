import Ember from 'ember';
//import config from '../config/environment';
const { $ } = Ember;

export default Ember.Service.extend({
  locals: Ember.inject.service(),
  i18n: Ember.inject.service(),
  EventBus: Ember.inject.service(),
  
  supportedLocales: {
    
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
  
  /**
   * Language should be a localisation string, e.g. 'en-gb', or 'fr-fr'
   */
  
  initLocale: Ember.on('init',function(){
    
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
    
    this.change(locale);
    //this.change('it');
    this.change('en-gb'); // Must manually change back to english since locales are remembered
    this.getUIContent();
    
    /*let self = this;
    Ember.run.later(function(){
      self.change('it');
    },5000);*/
    
  }),
  
  getUIContent(){
    
    // TODO
    // Load general UI content items from API, and load them into ember-i18n
    
  },
  
  change( locale ) {
    
    if( !Ember.isEmpty( this.get('supportedLocales.'+locale) ) ){
      
      this.get('locals').put('locale',locale);
      this.set('currentLocale',locale);
      this.set('i18n.locale', locale); // ember-i18n
      this.updateAJAX();
      
      // Broadcast event
      this.get('EventBus').publish('localeChanged', locale);
      
    } else {
      Ember.Logger.warn( 'Tried to set unknown locale: ' + locale );
    }
    
  },
  
  updateAJAX() {
    
    $.ajaxSetup({
        headers: {
          'Accept-Language': this.get('currentLocale'),
        },
    });
    
  },
  
});
