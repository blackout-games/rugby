Error.stackTraceLimit=100;
import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

/**
 * Remove deprecations, so that we don't have them spamming the console due to code in dependencies which hasn't been fixed yet.
 * 
 * Allow this on update day only, so that we can fix any deprecations in our own code
 * Chrome regex filter: ^((?!DEPRECATION: ).)*$
 */
const allowDeprecations = false;

const alreadyShownFactory = () => {
  let alreadyShown = [];
  return (msg, test, opt) => {
    if (test){
      return false;
    }
    if(!allowDeprecations){
      return false;
    }
    if( alreadyShown.indexOf(msg) === -1 && false ) {
      let warning = 'DEPRECATION: ' + msg;
      if(opt && opt.url) {
        warning += ' See: ' + opt.url;
      }
      console.warn(warning);
      alreadyShown.push(msg);
    }
  };
};
Ember.deprecate = alreadyShownFactory();
Ember.warn = alreadyShownFactory();

//see https://guides.emberjs.com/v2.3.0/configuring-ember/handling-deprecations/
Ember.Debug.registerDeprecationHandler((() => {
  let alreadyShown = [];
  return (message, options, next) => {
    if(!allowDeprecations){
      return false;
    }
    if(alreadyShown.indexOf(message) === -1) {
      next(message, options);
      alreadyShown.push(message);
    }
  };
})());

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
