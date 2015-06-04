import EventBus from '../services/event-bus';

export function initialize(registry, application) {
  application.register('service:event-bus', EventBus);
  application.inject('component', 'EventBus', 'service:event-bus');
  application.inject('controller', 'EventBus', 'service:event-bus');
}

export default {
  name: 'event-bus',
  initialize: initialize
};