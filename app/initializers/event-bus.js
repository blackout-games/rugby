import eventBus from '../services/event-bus';

export function initialize(application) {
  application.register('service:event-bus', eventBus);
  application.inject('component', 'eventBus', 'service:event-bus');
  application.inject('controller', 'eventBus', 'service:event-bus');
  application.inject('route', 'eventBus', 'service:event-bus');
}

export default {
  name: 'event-bus',
  initialize: initialize
};