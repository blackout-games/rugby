import Ember from 'ember';

export function competition(params/*, hash*/) {
  
  if(!params[0]){ return ''; }
  
  let comp = params[0].dasherize();
  let translated = this.get('i18n').t('competitions.' + comp);
  
  if(translated.toString().indexOf('missing translation')>=0){
    return params[0];
  } else {
    return translated;
  }
  
}

export default Ember.Helper.extend({
  i18n: Ember.inject.service(),
  compute: competition
});
