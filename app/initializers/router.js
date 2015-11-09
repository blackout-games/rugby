/**
 * 
 * Adds router support to components.
 * 
 * Allows us to transition to a route from within components.
 * 
 */

export function initialize(application) {
  application.inject('component', 'router', 'router:main');
}

export default {
  name: 'router',
  initialize: initialize
};