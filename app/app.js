Error.stackTraceLimit=100;
import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

/**
 * Remove deprecations, so that we don't have them spamming the console due to code in dependencies which hasn't been fixed yet.
 * 
 * Allow this on update day only, so that we can fix any deprecations in our own code
 */
//Ember.deprecate = function(){};

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  ready() {
    Ember.run.later(function(){
      Ember.$("#splash").fadeOut(444,function(){
        //Ember.$(this).remove();
        Ember.$(this).hide();
      });
    },1);
    
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
