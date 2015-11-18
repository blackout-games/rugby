import Ember from 'ember';
import config from './config/environment';

Ember.Router.reopen({
  history: Ember.inject.service(),
  EventBus: Ember.inject.service('event-bus'),
  
  doSomethingOnUrlChange: Ember.on('didTransition', function() {
    this.get('history').update(this.get('url'));
  }),
  
});

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('signup');
  this.route('dashboard');
  this.route('national-news', function() {
    this.route('article', {
      path: ':id'
    });
  });
  this.route('countries', function() {
    this.route('country', {
      path: ':id'
    });
  });
  this.route('news', function() {
    this.route('article', {
      path: ':id'
    });
  });
  this.route('coming-soon');
  this.route('blocked');
});

export default Router;
