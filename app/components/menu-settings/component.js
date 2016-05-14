import Ember from 'ember';

//let locales = [];

export default Ember.Component.extend({
  
  classNames: ['menu-settings-container'],
  locale: Ember.inject.service(),
  
  setup: Ember.on('init',function(){
    this.set('locales',this.get('locale').getLocalesList());
    this.set('currentLocale',this.get('locale').getLocale());
  }),
  
  actions:{
    changeLocale(locale){
      this.set('currentLocale',locale);
      this.get('locale').change(locale.locale);
    },
  },
  
});