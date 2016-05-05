export function initialize(appInstance) {
  appInstance.inject('component', 'cache', 'service:cache');
}

export default {
  name: 'cache',
  initialize
};
