export function initialize( application ) {
  //application.inject('service:preferences', 'store', 'service:store');
  
  // Just looking up the service will initiate it
  // Otherwise it will only lazy load when needed
  // But we need to load in default preferences
  application.container.lookup('service:preferences');
  application.container.lookup('service:blur');
  
}

export default {
  name: 'services',
  //before: 'simple-auth',
  initialize: initialize
};
