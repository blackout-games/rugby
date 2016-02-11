Error.stackTraceLimit=100;
import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

/**
 * Remove deprecations, so that we don't have them spamming the console due to code in dependencies which hasn't been fixed yet.
 * 
 * Allow this on update day only, so that we can fix any deprecations in our own code
 * Chrome regex filter: ^((?!DEPRECATION: ).)*$
 */
Ember.deprecate = function(){};

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
});

loadInitializers(App, config.modulePrefix);

export default App;
