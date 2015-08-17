/* jshint node: true */

module.exports = function(environment) {
  
  var offlineMode = true;
  var localIP = '192.168.20.5'; // Home
  //var localIP = '192.168.1.150'; // Nat's + parents
  
  /*********************
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
  
  /*********************/
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
    LOCALE: 'en',
    
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
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' use.typekit.net connect.facebook.net", //  'unsafe-eval' 
      'font-src': "'self' use.typekit.net data: ",
      'connect-src': "'self' "+apiHost,
      'img-src': "'self' data: www.facebook.com p.typekit.net *",
      'style-src': "'self' 'unsafe-inline' use.typekit.net",
      'frame-src': "s-static.ak.facebook.com static.ak.facebook.com www.facebook.com"
    },
  };
  
  ENV['simple-auth'] = {
    store: 'simple-auth-session-store:local-storage',
    authorizer: 'simple-auth-authorizer:oauth2-bearer',
    crossOriginWhitelist: [apiProtocol+'://'+apiHost],
    routeIfAlreadyAuthenticated: 'manager',//'dashboard',
    session: 'session:blackout',
  };
  
  ENV['simple-auth-oauth2'] = {
    serverTokenEndpoint: apiProtocol+'://'+apiHost+apiBase+'/token'
  };
  
  ENV['torii'] = {
    providers: {
      'facebook-oauth2': {
        apiKey: '230716417077656',
        //redirectUri: '/dashboard' // default is the current URL
      }
    }
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
    ENV.contentSecurityPolicy['script-src'] += " " + localIP + ":4444 " + localIP + ":49152 ws://" + localIP + ":49152 ember.blackoutrugby.com:49152";
    ENV.contentSecurityPolicy['connect-src'] += " " + devApiHost + " " + localIP + ":4444 " + localIP + ":49152 ws://" + localIP + ":49152 ws://ember.blackoutrugby.com:49152 dah9mm7p1hhc3.cloudfront.net";
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
