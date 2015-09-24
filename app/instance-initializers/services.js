export function initialize( application ) {
  //application.inject('service:preferences', 'store', 'service:store');
  
  // Just looking up the service will initiate it
  // Otherwise it will only lazy load when needed
  // But we need to load in default preferences
  
  // Watches for unfocus from a browser window or tab
  application.container.lookup('service:blur'); 
  
  // Handles local bites, which are sent with all ajax requests as a header
  application.container.lookup('service:bites'); 
  
}

export default {
  name: 'services',
  //before: 'simple-auth',
  initialize: initialize
};
