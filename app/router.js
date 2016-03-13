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
  this.route('news', function() {
    this.route('article', {
      path: ':id'
    });
  });
  this.route('coming-soon');
  this.route('blocked');
  this.route('squad', function() {
    this.route('club', {
      path: ':club_id'
    });
  });
  this.route('players', function() {
    this.route('player', {
      path: ':player_id'
    }, function() {
      this.route('statistics', function() {
        this.route('attack');
        this.route('defence');
        this.route('kicking');
        this.route('handling');
        this.route('discipline');
        this.route('lineout');
        this.route('points');
        this.route('caps');
      });
      this.route('history');
    });
  });
  this.route('account');
  this.route('nope', { path: '/*path'});
  this.route('nope');
});

export default Router;
