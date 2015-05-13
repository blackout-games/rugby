//import eventBus from "../services/event-bus";

export function initialize(container, application) {
  application.inject('component', 'EventBus', 'service:event-bus');
  application.inject('controller', 'EventBus', 'service:event-bus');
}

export default {
  name: 'event-bus',
  initialize: initialize
};
