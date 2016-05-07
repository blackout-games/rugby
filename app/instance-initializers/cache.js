export function initialize(appInstance) {
  appInstance.inject('component', 'cache', 'service:cache');
  appInstance.inject('route', 'cache', 'service:cache');
}

export default {
  name: 'cache',
  initialize
};
