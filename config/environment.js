/* jshint node: true */

module.exports = function(environment) {
  
  var offlineMode = true;
  var localIP = '192.168.20.5'; // Home
  //var localIP = '192.168.1.150'; // Nat's parents
  
  /*********************/
  // Development API (Local)
  var devApiBase = '';
  var devApiProtocol = 'http';
  var devApiHost = localIP + ':4444';
  /*********************/
  
  /*********************
  // Development API (Live, Test)
  var devApiBase = '/v1';
  var devApiProtocol = 'http';
  var devApiHost = 'apitest.blackoutrugby.com';
  /*********************/
  
  /*********************
  // Development API (Live, Production)
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
    offlineMode: offlineMode,
    modulePrefix: 'rugby-ember',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    
    assetFilesPrepend: 'https://dah9mm7p1hhc3.cloudfront.net/',
    
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
      apiBase: apiBase,
    },
    contentSecurityPolicyHeader: 'Content-Security-Policy',
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' dah9mm7p1hhc3.cloudfront.net 'unsafe-inline' use.typekit.net connect.facebook.net", //  'unsafe-eval' 
      'font-src': "'self' dah9mm7p1hhc3.cloudfront.net use.typekit.net data: ",
      'connect-src': "'self' "+apiHost,
      'img-src': "'self' data: www.facebook.com p.typekit.net *",
      'style-src': "'self' 'unsafe-inline' use.typekit.net dah9mm7p1hhc3.cloudfront.net",
      'frame-src': "s-static.ak.facebook.com static.ak.facebook.com www.facebook.com dah9mm7p1hhc3.cloudfront.net"
    },
  };
  
  ENV['simple-auth'] = {
    store: 'simple-auth-session-store:local-storage',
    authorizer: 'simple-auth-authorizer:oauth2-bearer',
    crossOriginWhitelist: [apiProtocol+'://'+apiHost],
  };
  
  ENV['simple-auth-oauth2'] = {
    serverTokenEndpoint: apiProtocol+'://'+apiHost+apiBase+'/token'
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    
    ENV.assetFilesPrepend = '/';
    ENV.APP.apiProtocol = devApiProtocol;
    ENV.APP.apiHost = devApiHost;
    ENV.APP.apiBase = devApiBase;
    ENV.contentSecurityPolicy['script-src'] += " " + localIP + ":4444 " + localIP + ":35729 ws://" + localIP + ":35729";
    ENV.contentSecurityPolicy['connect-src'] += " " + localIP + ":4444 " + localIP + ":35729 ws://" + localIP + ":35729";
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
