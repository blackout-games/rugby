import Ember from 'ember';

/**
 * TODO: if needed, support just sending in a username, id, and url via hash/options
 */

export function manager(params) {
  
  let userImages = this.get('userImages');
  
  let html = Ember.Blackout.promiseHTML(params,function(data){
    
    if(!data){
      Ember.Logger.warn('Manager given to manager helper was empty');
      return '';
    }
    
    return userImages.getManagerHTML( data );
    
  },'localeChanged');
  
  return Ember.String.htmlSafe(html);
  
}

export default Ember.Helper.extend({
  userImages: Ember.inject.service(),
  compute: manager,
});
