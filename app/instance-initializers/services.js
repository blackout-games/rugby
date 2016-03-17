export function initialize( application ) {
  
  
  // Just looking up the service will initiate it
  // Otherwise it will only lazy load when needed
  // But we need to load in default preferences
  
  // Handles the current i18n locale
  application.lookup('service:locale');
  
  // Watches for unfocus from a browser window or tab
  application.lookup('service:blur'); 
  
  // Handles local bites, which are sent with all ajax requests as a header
  application.lookup('service:bites'); 
  
  // Handles user images like manager avatars
  application.lookup('service:user-images'); 
  
}

export default {
  name: 'services',
  //after: 'event-bus',
  initialize: initialize
};
