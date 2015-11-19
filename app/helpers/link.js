import Ember from 'ember';
import bindRouteLink from '../utils/bind-route-link';

export function link(params, hash) {
  
  // Defaults
  let options = Ember.Object.create({
    
    /**
     * The text value which will be visible
     */
    'value': '',
    
    /**
     * A normal href link (typically somewhere outside the app)
     * For a route inside the app, see `route` below
     */
    'href': '/',
    
    /**
     * A route to link to inside the app
     */
    'route': '',
    
    /**
     * CSS class list (space separated as normal)
     */
    'class': '',
    
  });
  
  // Merge new options over defaults
  options.setProperties(hash);
  
  if(options.route){
    options.href = options.route.replace(/\./g,'/');
  }
  
  let html = '<a href="' + options.href + '"' + (options.class ? 'class="' + options.class + '"' : '') + '>' + options.value + '</a>';
  
  if(options.route){
    html = bindRouteLink(options.route, html);
  }
  
  return Ember.String.htmlSafe(html);
}

export default Ember.Helper.helper(link);
