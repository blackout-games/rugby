import Ember from 'ember';

export function initialize(container, app) {
  // application.inject('route', 'foo', 'service:foo');
  //app.deferReadiness();
  //print('deferred');
  
  //Ember.run.later(function(){
    //app.advanceReadiness();
  //},1);
}

export default {
  name: 'defer',
  initialize: initialize
};
