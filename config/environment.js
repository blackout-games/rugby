/* jshint node: true */

module.exports = function(environment) {
  
  /*********************
  // Local API
  var devApiBase = '';
  var devApiProtocol = 'http';
  var devApiHost = 'localhost:4444';
  /*********************/
  
  /*********************/
  // Live Test API
  var devApiBase = '/v1';
  var devApiProtocol = 'http';
  var devApiHost = 'apitest.blackoutrugby.com';
  /*********************/
  
  /*********************
  // Live API
  var devApiBase = '/v1';
  var devApiProtocol = 'https';
  var devApiHost = 'api.blackoutrugby.com';
  /*********************/
  
  // Production API
  var apiBase = '/v1';
  var apiProtocol = 'https';
  var apiHost = 'api.blackoutrugby.com';
  
  /*********************/
  
  
  var ENV = {
    modulePrefix: 'rugby-ember',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      apiProtocol: apiProtocol,
      apiHost: apiHost,
    },
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' use.typekit.net connect.facebook.net", // 'unsafe-inline' 'unsafe-eval' 
      'font-src': "'self' data: use.typekit.net",
      'connect-src': "'self' "+apiHost,
      'img-src': "'self' www.facebook.com p.typekit.net",
      'style-src': "'self' use.typekit.net", //'unsafe-inline'
      'frame-src': "s-static.ak.facebook.com static.ak.facebook.com www.facebook.com"
    },
  };
  
  ENV['simple-auth'] = {
    store: 'simple-auth-session-store:local-storage',
    authorizer: 'simple-auth-authorizer:oauth2-bearer',
    crossOriginWhitelist: [apiProtocol+'://'+apiHost],
  }
  
  ENV['simple-auth-oauth2'] = {
    serverTokenEndpoint: apiProtocol+'://'+apiHost+apiBase+'/token'
  }

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    
    ENV.APP.apiProtocol = devApiProtocol;
    ENV.APP.apiHost = devApiHost;
    ENV.contentSecurityPolicy['connect-src'] = "'self' "+devApiHost;
    ENV['simple-auth'].crossOriginWhitelist = [devApiProtocol+'://'+devApiHost];
    ENV['simple-auth-oauth2'].serverTokenEndpoint = devApiProtocol+'://'+devApiHost+devApiBase+'/token';
    
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
