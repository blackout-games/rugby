import Modal from '../services/modal';

export function initialize(container, application) {
  application.register('service:modal', Modal);
  application.inject('component', 'modal', 'service:modal');
  application.inject('route', 'modal', 'service:modal');
}

export default {
  name: 'modal',
  initialize: initialize
};
