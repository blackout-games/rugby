import Ember from 'ember';
import Local from '../models/local';
import config from '../config/environment';

export function initialize(application) {
  
  let locals = Local.create();
  let locale = locals.get('locale');
  application.deferReadiness();
  
  if(Ember.isEmpty(locale)||true){
    
    // Check browser locale
    let url = config.APP.apiProtocol + '://' + config.APP.apiHost + config.APP.apiBase + '/headers/Accept-Language';
    
    Ember.$.getJSON(url,function(data){
      
      if( data && data.data && data.data.id === 'Accept-Language' ){
        window.blackout.languageHeader = data.data.attributes.value;
      }
      
      application.advanceReadiness();
      
    });
    
  }
  
}

export default {
  name: 'locale',
  after: 'blackout',
  //before: 'services',
  initialize: initialize
};
