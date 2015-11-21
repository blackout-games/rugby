import Ember from 'ember';
//import bindRouteLink from '../utils/bind-route-link';

export function country(params, options) {
  
  let html = Ember.Blackout.promiseHTML(params,function(data){
    
    if(!data){
      Ember.Logger.warn('Country given to country helper was empty');
      return '';
    }
    
    // For later
    //let route = '/countries/'+data.get('id');
    
    return '<a href="http://www.blackoutrugby.com/game/global.lobby.php?iso=' + data.get('id') + '"' + (options.class ? ' class="' + options.class + '"' : '') + '>' + data.get('name') + '</a>';
    
    // For later
    //return html = bindRouteLink(route, html);
    
  },'localeChanged');
  
  return Ember.String.htmlSafe(html);
  
}

export default Ember.Helper.helper(country);
